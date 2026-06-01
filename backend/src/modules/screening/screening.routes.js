const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { asyncHandler } = require('../../middleware/errorHandler');
const ScreeningSession = require('./session.model');
const Resume = require('../resumes/resume.model');
const Candidate = require('../candidates/candidate.model');
const { scoreWithText } = require('../../lib/scorer');

const router = express.Router();

// Create a new screening session
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId required' });

    const session = await ScreeningSession.create({
      jobId,
      createdBy: req.user.id,
    });

    res.status(201).json(session);
  })
);

// Run scoring on all resumes in a session
router.post(
  '/:sessionId/run',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { jdText } = req.body;
    if (!jdText) return res.status(400).json({ message: 'jdText required' });

    const session = await ScreeningSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'processing';
    await session.save();

    // Find all resumes and existing candidates in this session
    const resumes = await Resume.find({ sessionId: session._id });
    const existingCandidates = await Candidate.find({ sessionId: session._id });

    const candidateDocs = [];

    // Create a map of resumeId -> Resume for quick lookup
    const resumeMap = new Map();
    resumes.forEach(r => resumeMap.set(r._id.toString(), r));

    // Track which resumes already have candidates bound to them
    const resumeIdsWithCandidates = new Set(
      existingCandidates.filter(c => c.resumeId).map(c => c.resumeId.toString())
    );

    // 1. Process all existing candidates in this session
    for (const candidate of existingCandidates) {
      let result;
      if (candidate.resumeId && resumeMap.has(candidate.resumeId.toString())) {
        // Candidate has a parsed resume text, score using the resume's raw text
        const resume = resumeMap.get(candidate.resumeId.toString());
        result = scoreWithText(resume.parsed, resume.rawText || '', jdText, session.weights);
        
        candidate.score = result.total;
        candidate.scoreBreakdown = result.breakdown;
        candidate.matchedSkills = result.matchedSkills;
        candidate.missingSkills = result.missingSkills;
        candidate.shortlisted = result.total >= 75;

        // Synchronize parsed metadata fields
        candidate.college = resume.parsed?.college || candidate.college;
        candidate.recentCompany = resume.parsed?.recentCompany || candidate.recentCompany;
        candidate.recentRole = resume.parsed?.recentRole || candidate.recentRole;
      } else {
        // Candidate was manually added without a resume, score using profile details
        const pseudoResumeText = `
          ${candidate.name}
          Skills: ${(candidate.skills || []).join(', ')}
          Experience: ${candidate.experience || 0} years
          Education: ${candidate.education || ''}
          College: ${candidate.college || ''}
          Company: ${candidate.recentCompany || ''}
          Role: ${candidate.recentRole || ''}
        `;
        const parsedMock = {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          skills: candidate.skills,
          experience: candidate.experience,
          education: candidate.education,
          college: candidate.college,
          recentCompany: candidate.recentCompany,
          recentRole: candidate.recentRole
        };
        result = scoreWithText(parsedMock, pseudoResumeText, jdText, session.weights);
        
        candidate.score = result.total;
        candidate.scoreBreakdown = result.breakdown;
        candidate.matchedSkills = result.matchedSkills;
        candidate.missingSkills = result.missingSkills;
        candidate.shortlisted = result.total >= 75;
      }

      // Maintain user statuses (such as manual overrides or rejects) where appropriate
      if (candidate.status !== 'rejected') {
        candidate.status = candidate.shortlisted ? 'shortlisted' : 'reviewing';
      }

      await candidate.save();
      candidateDocs.push(candidate);
    }

    // 2. Process newly uploaded resumes that do not have candidate records yet (e.g. bulk initial upload)
    for (const resume of resumes) {
      if (!resumeIdsWithCandidates.has(resume._id.toString())) {
        const result = scoreWithText(resume.parsed, resume.rawText || '', jdText, session.weights);
        const newCand = await Candidate.create({
          sessionId: session._id,
          resumeId: resume._id,
          name: resume.parsed?.name || resume.fileName,
          email: resume.parsed?.email,
          phone: resume.parsed?.phone,
          skills: resume.parsed?.skills || [],
          experience: resume.parsed?.experience || 0,
          education: resume.parsed?.education || '',
          college: resume.parsed?.college || '',
          recentCompany: resume.parsed?.recentCompany || '',
          recentRole: resume.parsed?.recentRole || '',
          score: result.total,
          scoreBreakdown: result.breakdown,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          shortlisted: result.total >= 75,
          status: result.total >= 75 ? 'shortlisted' : 'reviewing',
        });
        candidateDocs.push(newCand);
      }
    }

    // Sort and assign ranks
    candidateDocs.sort((a, b) => b.score - a.score);
    for (let i = 0; i < candidateDocs.length; i++) {
      candidateDocs[i].rank = i + 1;
      await candidateDocs[i].save();
    }

    const top = candidateDocs[0];
    session.status = 'completed';
    session.resumeCount = candidateDocs.length;
    session.shortlistedCount = candidateDocs.filter((c) => c.shortlisted).length;
    session.topScore = top?.score || 0;
    session.topCandidate = top?.name || '—';
    await session.save();

    res.json({ session, candidates: candidateDocs });
  })
);

// Get all sessions for the logged-in user
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await ScreeningSession.find({ createdBy: req.user.id })
      .sort('-createdAt')
      .populate('jobId', 'title company')
      .lean();
    res.json(sessions);
  })
);

router.get(
  '/:sessionId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const session = await ScreeningSession.findById(req.params.sessionId)
      .populate('jobId', 'title company description');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  })
);

// PATCH /:sessionId/weights — update weights for the session
router.patch(
  '/:sessionId/weights',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { weights } = req.body;
    if (!weights) return res.status(400).json({ message: 'Weights required' });
    
    const session = await ScreeningSession.findOneAndUpdate(
      { _id: req.params.sessionId, createdBy: req.user.id },
      { $set: { weights } },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  })
);

// DELETE /:sessionId — remove session and its candidates
router.delete(
  '/:sessionId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const session = await ScreeningSession.findOneAndDelete({
      _id: req.params.sessionId,
      createdBy: req.user.id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Cascade delete candidates and resumes for this session
    await Candidate.deleteMany({ sessionId: req.params.sessionId });
    await Resume.deleteMany({ sessionId: req.params.sessionId });

    res.json({ message: 'Session deleted' });
  })
);

module.exports = router;
