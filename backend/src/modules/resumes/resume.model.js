const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScreeningSession', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    mimeType: String,
    rawText: String,
    parsed: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      experience: Number,
      education: String,
      college: String,
      recentCompany: String,
      recentRole: String,
      summary: String,
    },
    parseError: String,
  },
  { timestamps: true }
);

resumeSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
