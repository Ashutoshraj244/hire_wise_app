const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { asyncHandler } = require('../../middleware/errorHandler');
const Candidate = require('./candidate.model');

const router = express.Router();

// GET /session/:sessionId — list with filter/sort/pagination
router.get(
  '/session/:sessionId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, filter, sortBy = 'score', order = 'desc', minScore } = req.query;

    const query = { sessionId: req.params.sessionId };

    if (filter === 'shortlisted') query.shortlisted = true;
    else if (filter === 'rejected') query.status = 'rejected';
    else if (filter === 'reviewing') {
      query.shortlisted = false;
      query.status = { $ne: 'rejected' };
    }

    if (minScore) query.score = { $gte: Number(minScore) };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const sortDir = order === 'asc' ? 1 : -1;
    const total = await Candidate.countDocuments(query);
    const candidates = await Candidate.find(query)
      .sort({ [sortBy]: sortDir })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      candidates,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  })
);

// GET /session/:sessionId/export — must be defined before /:id routes
router.get(
  '/session/:sessionId/export',
  requireAuth,
  asyncHandler(async (req, res) => {
    const candidates = await Candidate.find({ sessionId: req.params.sessionId })
      .sort('-score')
      .lean();

    if (!candidates.length) return res.status(404).json({ message: 'No candidates found for this session' });

    const header = ['Rank', 'Name', 'Email', 'Score', 'Experience', 'Education', 'Skills', 'Missing Skills', 'Shortlisted', 'Status', 'Notes'];
    const rows = candidates.map((c, i) => [
      i + 1,
      c.name,
      c.email || '',
      c.score,
      c.experience ? `${c.experience}y` : '',
      c.education || '',
      (c.skills || []).join('; '),
      (c.missingSkills || []).join('; '),
      c.shortlisted ? 'Yes' : 'No',
      c.status,
      c.notes || '',
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="candidates-${req.params.sessionId}.csv"`);
    res.send(csv);
  })
);

// GET /:id — single candidate detail
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  })
);

// PATCH /:id/shortlist — toggle
router.patch(
  '/:id/shortlist',
  requireAuth,
  asyncHandler(async (req, res) => {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    candidate.shortlisted = !candidate.shortlisted;
    if (candidate.shortlisted) candidate.status = 'shortlisted';
    else if (candidate.status === 'shortlisted') candidate.status = 'reviewing';

    await candidate.save();
    res.json(candidate);
  })
);

// PATCH /:id/status — set reviewing | shortlisted | rejected
router.patch(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ['reviewing', 'shortlisted', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status, shortlisted: status === 'shortlisted' },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  })
);

// PATCH /:id/notes — save recruiter note
router.patch(
  '/:id/notes',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { notes } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json({ notes: candidate.notes });
  })
);

// POST / — Manually create and rank a custom candidate profile
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { sessionId, resumeId, name, email, phone, skills, experience, education, college, recentCompany, recentRole, score } = req.body;
    if (!sessionId || !name || score === undefined) {
      return res.status(400).json({ message: 'sessionId, name, and score are required' });
    }

    const parsedScore = Number(score);
    const shortlisted = parsedScore >= 75;

    // Create candidate
    const candidate = await Candidate.create({
      sessionId,
      resumeId: resumeId || undefined,
      name,
      email,
      phone,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim().toLowerCase()) : []),
      experience: experience ? Number(experience) : 0,
      education,
      college,
      recentCompany,
      recentRole,
      score: parsedScore,
      scoreBreakdown: {
        skills: Math.round(parsedScore * 0.5),
        experience: Math.round(parsedScore * 0.25),
        education: Math.round(parsedScore * 0.15),
        keyword: Math.round(parsedScore * 0.1)
      },
      shortlisted,
      status: shortlisted ? 'shortlisted' : 'reviewing'
    });

    // Recalculate ranks in this session
    const sessionCandidates = await Candidate.find({ sessionId }).sort('-score');
    for (let i = 0; i < sessionCandidates.length; i++) {
      sessionCandidates[i].rank = i + 1;
      await sessionCandidates[i].save();
    }

    // Fetch the updated candidate with their rank
    const updated = await Candidate.findById(candidate._id);
    res.status(201).json(updated);
  })
);

module.exports = router;
