const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScreeningSession', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    name: { type: String, required: true },
    email: String,
    phone: String,
    location: String,
    skills: [String],
    matchedSkills: [String],
    missingSkills: [String],
    experience: Number,
    education: String,
    college: String,
    recentCompany: String,
    recentRole: String,
    summary: String,
    score: { type: Number, required: true },
    scoreBreakdown: {
      skills: Number,
      experience: Number,
      education: Number,
      keyword: Number,
    },
    rank: Number,
    shortlisted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['reviewing', 'shortlisted', 'rejected'],
      default: 'reviewing',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

candidateSchema.index({ sessionId: 1, score: -1 });
candidateSchema.index({ sessionId: 1, shortlisted: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
