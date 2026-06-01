const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../../middleware/auth');
const { asyncHandler } = require('../../middleware/errorHandler');
const Resume = require('./resume.model');
const { extractText, parseResume } = require('./resume.parser');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_, file, cb) {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /upload — parse and store resumes for a session
router.post(
  '/upload',
  requireAuth,
  upload.array('resumes', 20),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });

    const results = [];

    for (const file of req.files) {
      try {
        const text = await extractText(file.buffer, file.originalname);
        const parsed = parseResume(text);
        const resume = await Resume.create({
          sessionId,
          uploadedBy: req.user.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
          rawText: text,
          parsed,
        });
        results.push({ id: resume._id, fileName: file.originalname, parsed, ok: true });
      } catch (err) {
        results.push({ fileName: file.originalname, ok: false, error: err.message });
      }
    }

    res.json({
      uploaded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  })
);

// POST /parse-and-upload — parse, store a single resume, and return parsed info for autofilling
router.post(
  '/parse-and-upload',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
      const text = await extractText(req.file.buffer, req.file.originalname);
      const parsed = parseResume(text);
      const resume = await Resume.create({
        sessionId,
        uploadedBy: req.user.id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        rawText: text,
        parsed,
      });

      res.json({
        success: true,
        resumeId: resume._id,
        parsed: {
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          skills: parsed.skills || [],
          experience: parsed.experience || 0,
          education: parsed.education || '',
          college: parsed.college || '',
          recentCompany: parsed.recentCompany || '',
          recentRole: parsed.recentRole || '',
          summary: parsed.summary || ''
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to parse resume', error: err.message });
    }
  })
);

// GET /session/:sessionId — list resumes (no rawText)
router.get(
  '/session/:sessionId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const resumes = await Resume.find({ sessionId: req.params.sessionId })
      .select('-rawText')
      .lean();
    res.json(resumes);
  })
);

// DELETE /:id — remove a resume before screening runs
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      uploadedBy: req.user.id,
    });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  })
);

module.exports = router;
