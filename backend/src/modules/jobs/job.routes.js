const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../../middleware/auth');
const { asyncHandler } = require('../../middleware/errorHandler');
const Job = require('./job.model');
const { extractText } = require('../resumes/resume.parser');

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

router.post(
  '/parse',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
      const text = await extractText(req.file.buffer, req.file.originalname);
      res.json({ success: true, text });
    } catch (err) {
      res.status(500).json({ message: 'Failed to parse JD file', error: err.message });
    }
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, company, description } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'title and description required' });
    const job = await Job.create({ title, company, description, createdBy: req.user.id });
    res.status(201).json(job);
  })
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user.id }).sort('-createdAt').lean();
    res.json(jobs);
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  })
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, company, description } = req.body;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { title, company, description },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Deleted' });
  })
);

module.exports = router;
