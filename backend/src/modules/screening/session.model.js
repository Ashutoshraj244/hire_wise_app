const mongoose = require('mongoose');

const screeningSessionSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    resumeCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    topScore: Number,
    topCandidate: String,
    weights: {
      skills: { type: Number, default: 50 },
      experience: { type: Number, default: 25 },
      education: { type: Number, default: 15 },
      keyword: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

screeningSessionSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('ScreeningSession', screeningSessionSchema);
