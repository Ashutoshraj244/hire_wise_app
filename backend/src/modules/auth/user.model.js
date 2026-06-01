const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'recruiter' },
    department: { type: String, default: 'Talent Acquisition' },
    company: { type: String, default: 'Acme Corp' },
    settings: {
      bannerPreset: { type: String, default: 'ocean-gradient' },
      accentTheme: { type: String, default: '#2563eb' },
      scoringWeights: {
        skills: { type: Number, default: 50 },
        experience: { type: Number, default: 25 },
        education: { type: Number, default: 15 },
        keyword: { type: Number, default: 10 }
      }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform(_, obj) {
    delete obj.password;
    return obj;
  },
});

module.exports = mongoose.model('User', userSchema);
