require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../modules/auth/user.model');
const Candidate = require('../modules/candidates/candidate.model');
const ScreeningSession = require('../modules/screening/session.model');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await ScreeningSession.deleteMany({});
  await Candidate.deleteMany({});

  // Create demo user
  const user = await User.create({
    name: 'Aisha Sharma',
    email: 'aisha.sharma@acme.co',
    password: 'demo1234',
    role: 'recruiter',
  });
  console.log('Created user:', user.email);

  const Job = require('../modules/jobs/job.model');

  const jd = `Senior Frontend Engineer — Acme Corp

We're looking for an experienced frontend engineer to join our product team.

Requirements:
- 3+ years of experience with React and modern JavaScript
- Strong understanding of HTML, CSS, and responsive design
- Experience with REST APIs and state management (Redux, Zustand)
- Familiarity with TypeScript
- Experience with Jest and React Testing Library
- Git workflow and code review experience

Nice to have:
- Node.js / Express experience
- AWS or GCP familiarity
- GraphQL experience`;

  const job = await Job.create({
    title: 'Senior Frontend Engineer',
    company: 'Acme Corp',
    description: jd,
    createdBy: user._id,
  });

  // Create screening session
  const session = await ScreeningSession.create({
    jobId: job._id,
    createdBy: user._id,
    status: 'completed',
    resumeCount: 6,
    shortlistedCount: 3,
    topScore: 95,
    topCandidate: 'Vikram Patel',
  });

  const candidates = [
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@gmail.com',
      phone: '+91 9876543210',
      location: 'Bangalore, KA',
      experience: 5,
      education: 'B.Tech Computer Science, IIT Bombay',
      detailedEducation: [
        { program: 'B.Tech in Computer Science', institution: 'IIT Bombay', year: '2015 - 2019' }
      ],
      detailedExperience: [
        { company: 'Stripe', role: 'Senior Frontend Engineer', years: '2021 - Present', description: 'Built and maintained React component library used across 12 internal products. Reduced bundle size by 40%.' },
        { company: 'Figma', role: 'Frontend Engineer', years: '2019 - 2021', description: 'Developed real-time collaboration features in React.' }
      ],
      skills: ['react', 'typescript', 'node', 'redux', 'jest', 'git', 'graphql', 'aws'],
      matchedSkills: ['react', 'typescript', 'node', 'redux', 'jest', 'git', 'graphql', 'aws'],
      missingSkills: [],
      score: 94,
      scoreBreakdown: { skills: 48, experience: 24, education: 13, keyword: 9 },
      shortlisted: true,
      status: 'shortlisted',
      rank: 2,
      summary: 'Frontend engineer with 5 years building React applications at scale. Led frontend at two Series B startups.',
    },
    {
      name: 'Vikram Patel',
      email: 'v.patel@proton.me',
      phone: '+91 9123456789',
      location: 'Pune, MH',
      experience: 7,
      education: 'M.S. Software Engineering, IIIT Hyderabad',
      detailedEducation: [
        { program: 'M.S. Software Engineering', institution: 'IIIT Hyderabad', year: '2014 - 2016' },
        { program: 'B.Tech Computer Science', institution: 'NIT Warangal', year: '2010 - 2014' }
      ],
      detailedExperience: [
        { company: 'Fintech Inc', role: 'Staff Software Engineer', years: '2020 - Present', description: 'Architected micro-frontend architecture for trading platform.' },
        { company: 'DevAgency', role: 'Full Stack Developer', years: '2016 - 2020', description: 'Led full stack development for 5 major client projects.' }
      ],
      skills: ['react', 'typescript', 'node', 'graphql', 'aws', 'redux', 'jest'],
      matchedSkills: ['react', 'typescript', 'node', 'graphql', 'aws', 'redux', 'jest'],
      missingSkills: [],
      score: 95,
      scoreBreakdown: { skills: 47, experience: 25, education: 14, keyword: 9 },
      shortlisted: true,
      status: 'shortlisted',
      rank: 1,
      summary: 'Full-stack engineer with 7 years of experience, deep frontend focus for the last 4. Strong on architecture and test coverage.',
    },
    {
      name: 'Priya Nair',
      email: 'priya.nair@outlook.com',
      phone: '(512) 774-0092',
      location: 'Austin, TX',
      experience: 4,
      education: "Bachelor's",
      skills: ['react', 'javascript', 'css', 'redux', 'rest', 'git', 'jest'],
      matchedSkills: ['react', 'javascript', 'css', 'redux', 'jest', 'git'],
      missingSkills: ['typescript', 'node'],
      score: 79,
      scoreBreakdown: { skills: 38, experience: 22, education: 11, keyword: 8 },
      shortlisted: true,
      status: 'shortlisted',
      rank: 3,
      summary: 'Frontend developer focused on React and performance. 4 years building consumer-facing products.',
      notes: 'Strong CSS skills, might ramp up on TS quickly.',
    },
    {
      name: 'Riya Mehta',
      email: 'riya.mehta.dev@gmail.com',
      phone: '(408) 221-9944',
      location: 'San Jose, CA',
      experience: 3,
      education: "Master's",
      skills: ['react', 'typescript', 'jest', 'redux', 'rest', 'git'],
      matchedSkills: ['react', 'typescript', 'jest', 'redux', 'git'],
      missingSkills: ['node', 'graphql', 'aws'],
      score: 74,
      scoreBreakdown: { skills: 35, experience: 18, education: 14, keyword: 7 },
      shortlisted: false,
      status: 'reviewing',
      rank: 4,
    },
    {
      name: 'Sanjay Gupta',
      email: 'sanjay.gupta@yahoo.com',
      phone: '+91 9000111222',
      location: 'Chennai, TN',
      experience: 6,
      education: 'Bootcamp Graduate, Masai School',
      detailedEducation: [
        { program: 'Full Stack Web Development', institution: 'Masai School', year: '2018' }
      ],
      detailedExperience: [
        { company: 'SaaS Corp', role: 'Frontend Engineer', years: '2021 - Present', description: 'Developing core dashboard features using Vue and React.' },
        { company: 'Digital Agency', role: 'Web Developer', years: '2018 - 2021', description: 'Client facing web development using modern JS frameworks.' }
      ],
      skills: ['vue', 'javascript', 'react', 'tailwind', 'node', 'express'],
      matchedSkills: ['javascript', 'react', 'css', 'git', 'aws', 'node'],
      missingSkills: ['typescript', 'redux', 'jest'],
      score: 70,
      scoreBreakdown: { skills: 31, experience: 23, education: 9, keyword: 7 },
      shortlisted: false,
      status: 'reviewing',
      rank: 5,
      summary: 'Product-focused UI engineer. Strong design sense and Vue ecosystem expertise.',
    },
    {
      name: 'Sneha Desai',
      email: 'sneha.desai@gmail.com',
      phone: '+91 9898989898',
      location: 'Hyderabad, TS',
      experience: 2,
      education: 'B.S. Information Systems, Bits Pilani',
      detailedEducation: [
        { program: 'B.S. Information Systems', institution: 'Bits Pilani', year: '2019 - 2023' }
      ],
      detailedExperience: [
        { company: 'Web Solutions', role: 'Web Developer', years: '2023 - Present', description: 'Building static sites and simple React SPAs for local businesses.' }
      ],
      skills: ['html', 'css', 'javascript', 'react', 'bootstrap', 'php'],
      matchedSkills: ['react', 'javascript', 'css', 'git'],
      missingSkills: ['typescript', 'redux', 'node', 'jest'],
      score: 53,
      scoreBreakdown: { skills: 22, experience: 14, education: 12, keyword: 5 },
      shortlisted: false,
      status: 'reviewing',
      rank: 6,
      notes: 'Underqualified for senior role. Revisit for mid-level opening.',
      summary: 'Enthusiastic junior developer with a passion for web accessibility and clean HTML/CSS.',
    },
  ];

  for (const c of candidates) {
    await Candidate.create({ ...c, sessionId: session._id });
  }

  console.log(`Seeded ${candidates.length} candidates`);
  console.log('Done. Login with aisha.sharma@acme.co / demo1234');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
