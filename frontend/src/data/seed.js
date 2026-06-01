// Realistic seed data for demo mode

export const DEMO_USER = {
  id: 'u1',
  name: 'Aisha Sharma',
  email: 'aisha.sharma@acme.co',
  role: 'Senior Recruiter',
};

export const DEMO_JD = `Senior Frontend Engineer — Acme Corp

We're looking for an experienced frontend engineer to join our product team. You'll work closely with design and backend teams to ship features that serve 50k+ users.

Requirements:
- 3+ years of experience with React and modern JavaScript (ES6+)
- Strong understanding of HTML, CSS, and responsive design
- Experience with REST APIs and state management (Redux, Zustand, or similar)
- Familiarity with TypeScript
- Experience with testing frameworks (Jest, React Testing Library)
- Git workflow and code review experience

Nice to have:
- Node.js / Express experience
- Familiarity with AWS or GCP
- GraphQL experience
- Contributions to open source

About the role:
- Full-time, remote-friendly (US timezones)
- Competitive salary: $120k-$160k depending on experience
- Work on a small, focused team
- Ship meaningful features weekly`;

export const SEED_CANDIDATES = [
  {
    id: 'c1',
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
    projects: ['react-perf-toolkit: Open source bundle analyzer for React apps (140 GitHub stars)', 'canvas-playground: WebGL experiments and React integration demos'],
    summary: 'Frontend engineer with 5 years building React applications at scale. Led frontend at two Series B startups.',
    scoreBreakdown: {
      skills: 48,
      experience: 24,
      education: 13,
      keyword: 9,
      total: 94,
    },
    shortlisted: true,
    status: 'shortlisted',
    rank: 2,
    notes: '',
    resumeText: `Rahul Verma
rahul.verma@gmail.com | (415) 882-3301 | San Francisco, CA

EXPERIENCE

Senior Frontend Engineer — Stripe (2021–Present)
- Built and maintained React component library used across 12 internal products
- Reduced bundle size by 40% through code splitting and lazy loading
- Led migration from class components to hooks for legacy codebase
- Mentored 3 junior engineers

Frontend Engineer — Figma (2019–2021)
- Developed real-time collaboration features in React
- Implemented complex canvas rendering with WebGL
- Worked closely with design team to build accessible UI components

PROJECTS
- react-perf-toolkit: Open source bundle analyzer for React apps (140 stars)
- canvas-playground: WebGL experiments with React integration

SKILLS
React, TypeScript, Node.js, Redux, Zustand, Jest, React Testing Library, GraphQL, AWS, Git, Webpack, Vite

EDUCATION
B.S. Computer Science — UC Berkeley (2019)`,
  },
  {
    id: 'c2',
    name: 'Priya Nair',
    email: 'priya.nair@outlook.com',
    phone: '+91 9988776655',
    location: 'Mumbai, MH',
    experience: 4,
    education: 'B.Tech Information Technology, VIT University',
    detailedEducation: [
      { program: 'B.Tech Information Technology', institution: 'VIT University', year: '2015 - 2019' }
    ],
    detailedExperience: [
      { company: 'RetailCo', role: 'Frontend Developer', years: '2020 - Present', description: 'Built product catalog and checkout flow in React serving 200k monthly users.' },
      { company: 'TechStartup', role: 'Junior Frontend Developer', years: '2019 - 2020', description: 'Maintained React component library and Storybook documentation.' }
    ],
    skills: ['react', 'javascript', 'css', 'redux', 'rest', 'git', 'jest'],
    matchedSkills: ['react', 'javascript', 'css', 'redux', 'jest', 'git'],
    missingSkills: ['typescript', 'node'],
    projects: ['storefront-ui: Internal React component library with Storybook documentation', 'perf-audit: Lighthouse CI integration for automated performance regression checks'],
    summary: 'Frontend developer focused on React and performance optimization. 4 years building consumer-facing products.',
    scoreBreakdown: {
      skills: 38,
      experience: 22,
      education: 11,
      keyword: 8,
      total: 79,
    },
    shortlisted: true,
    status: 'shortlisted',
    rank: 3,
    notes: 'Strong CSS skills, might ramp up on TS quickly.',
    resumeText: `Priya Nair
priya.nair@outlook.com | (512) 774-0092 | Austin, TX

EXPERIENCE

Frontend Developer — RetailCo (2020–Present)
- Built product catalog and checkout flow in React serving 200k monthly users
- Reduced page load time by 35% through lazy loading and image optimization
- Implemented A/B testing framework integrated with analytics

Junior Frontend Developer — TechStartup (2019–2020)
- Maintained React component library and Storybook documentation
- Fixed cross-browser compatibility issues in CSS

PROJECTS
- storefront-ui: Internal component library (React + Storybook)
- perf-audit: Lighthouse CI integration for automated performance checks

SKILLS
React, JavaScript, HTML, CSS, Redux, REST APIs, Git, Jest, Webpack

EDUCATION
B.Tech Information Technology — VIT University (2019)`,
  },
  {
    id: 'c3',
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
    projects: ['apollo-cache-inspector: Chrome DevTools extension for GraphQL cache debugging', 'react-ws-hooks: Custom hooks library for WebSocket state management (320 GitHub stars)'],
    summary: 'Full-stack engineer with 7 years of experience, deep frontend focus for the last 4. Strong on architecture and test coverage.',
    scoreBreakdown: {
      skills: 47,
      experience: 25,
      education: 14,
      keyword: 9,
      total: 95,
    },
    shortlisted: true,
    status: 'shortlisted',
    rank: 1,
    notes: '',
    resumeText: `Vikram Patel
v.patel@proton.me | (312) 490-5523 | Chicago, IL

EXPERIENCE

Staff Frontend Engineer — Basecamp (2020–Present)
- Architected new React-based frontend replacing aging Backbone.js codebase
- Established testing culture; increased coverage from 12% to 78%
- Worked on real-time features using WebSockets and optimistic UI

Senior Engineer — Groupon (2017–2020)
- Built promotional deal listing pages handling 1M+ daily pageviews
- Contributed to Node.js BFF layer for API aggregation

PROJECTS
- apollo-cache-inspector: Chrome DevTools extension for GraphQL cache debugging
- react-ws-hooks: Custom hooks library for WebSocket state management (320 stars)

SKILLS
React, TypeScript, Node.js, GraphQL, AWS, Redux, Jest, React Testing Library, Cypress, Git

EDUCATION
M.S. Software Engineering — Illinois Tech (2017)`,
  },
  {
    id: 'c4',
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
    projects: ['portfolio-v2: Personal portfolio built with React and Framer Motion', 'weather-app: OpenWeather API integration with React hooks'],
    summary: 'Junior frontend developer, 2 years experience. Strong design sensibility and component fundamentals.',
    scoreBreakdown: {
      skills: 22,
      experience: 14,
      education: 12,
      keyword: 5,
      total: 53,
    },
    shortlisted: false,
    status: 'reviewing',
    rank: 5,
    notes: 'Underqualified for senior role. Maybe revisit for mid-level opening.',
    resumeText: `Sneha Desai
sneha.desai@gmail.com | (646) 331-8874 | New York, NY

EXPERIENCE

Frontend Developer — Agency XYZ (2022–Present)
- Built landing pages and marketing sites using React
- Collaborated with designers to implement pixel-perfect layouts

Intern — Startup ABC (2021)
- Fixed UI bugs and wrote basic React components

PROJECTS
- portfolio-v2: Personal portfolio built with React and Framer Motion
- weather-app: OpenWeather API integration with React hooks

SKILLS
React, JavaScript, HTML, CSS, Git, Figma

EDUCATION
B.S. Computer Science — NYU (2022)`,
  },
  {
    id: 'c5',
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
    projects: ['cms-lite: Headless CMS with React frontend and Node.js/Express backend', 's3-deploy-cli: CLI tool for automated S3 deployments'],
    summary: '6 years of full-stack web development. Non-traditional CS background with strong AWS infrastructure knowledge.',
    scoreBreakdown: {
      skills: 31,
      experience: 23,
      education: 9,
      keyword: 7,
      total: 70,
    },
    shortlisted: false,
    status: 'reviewing',
    rank: 4,
    notes: '',
    resumeText: `Sanjay Gupta
sanjay.gupta@yahoo.com | (720) 553-1029 | Denver, CO

EXPERIENCE

Full Stack Developer — MediaCo (2018–Present)
- Built internal CMS in React and Node.js
- Maintained REST API for mobile app backend
- Managed AWS infrastructure: EC2, S3, CloudFront

Web Developer — Freelance (2017–2018)
- Built websites for small businesses using React and plain JS

PROJECTS
- cms-lite: Headless CMS with React frontend and Node.js/Express backend
- s3-deploy-cli: CLI tool for automated S3 deployments

SKILLS
JavaScript, React, CSS, Git, AWS, Node.js, PostgreSQL

EDUCATION
B.S. Electrical Engineering — Colorado State (2017)`,
  },
  {
    id: 'c6',
    name: 'Riya Mehta',
    email: 'riya.mehta.dev@gmail.com',
    phone: '(408) 221-9944',
    location: 'San Jose, CA',
    experience: 3,
    education: 'M.S. Computer Science, San Jose State',
    skills: ['react', 'typescript', 'jest', 'redux', 'rest', 'git'],
    matchedSkills: ['react', 'typescript', 'jest', 'redux', 'git'],
    missingSkills: ['node', 'graphql', 'aws'],
    projects: ['budget-tracker: Personal finance dashboard (React, TypeScript, Recharts)', 'typed-fetch: Lightweight typed wrapper around the fetch API (npm package)'],
    summary: '3 years frontend experience with strong TypeScript and testing skills. M.S. in Computer Science.',
    scoreBreakdown: {
      skills: 35,
      experience: 18,
      education: 14,
      keyword: 7,
      total: 74,
    },
    shortlisted: false,
    status: 'reviewing',
    rank: 3,
    notes: '',
    resumeText: `Riya Mehta
riya.mehta.dev@gmail.com | (408) 221-9944 | San Jose, CA

EXPERIENCE

Frontend Engineer — FinTech Startup (2021–Present)
- Built dashboard UI in React + TypeScript for financial reporting
- Wrote extensive unit and integration tests with Jest and React Testing Library
- Integrated REST APIs with typed Axios clients

Software Engineering Intern — Adobe (2020)
- Contributed to React-based internal tooling

PROJECTS
- budget-tracker: Personal finance dashboard (React, TypeScript, Recharts)
- typed-fetch: Lightweight typed wrapper around fetch API (npm package)

SKILLS
React, TypeScript, Jest, React Testing Library, Redux, REST APIs, Git

EDUCATION
M.S. Computer Science — San Jose State (2021)`,
  },
];

export const SEED_SESSIONS = [
  {
    id: 's1',
    jobTitle: 'Senior Frontend Engineer',
    company: 'Acme Corp',
    resumeCount: 6,
    shortlistedCount: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    topScore: 95,
    topCandidate: 'Vikram Patel',
  },
  {
    id: 's2',
    jobTitle: 'Backend Engineer (Node.js)',
    company: 'Acme Corp',
    resumeCount: 11,
    shortlistedCount: 4,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    topScore: 88,
    topCandidate: 'James Porter',
  },
  {
    id: 's3',
    jobTitle: 'Product Designer',
    company: 'Acme Corp',
    resumeCount: 8,
    shortlistedCount: 2,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    topScore: 91,
    topCandidate: 'Lena Park',
  },
];
