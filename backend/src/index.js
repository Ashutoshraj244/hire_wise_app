require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./database/connect');

const authRoutes = require('./modules/auth/auth.routes');
const resumeRoutes = require('./modules/resumes/resume.routes');
const jobRoutes = require('./modules/jobs/job.routes');
const screeningRoutes = require('./modules/screening/screening.routes');
const candidateRoutes = require('./modules/candidates/candidate.routes');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/candidates', candidateRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0" , () => console.log(`API running on :${PORT}`));
}).catch((err) => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});
