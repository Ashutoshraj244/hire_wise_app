# HireWise — Resume Screening Tool

An internal recruiter tool for uploading resumes, scoring them against a job description, and ranking candidates. Built as a full-stack project using React, Express, and MongoDB.

---

## What it does

1. Recruiter logs in
2. Creates a screening session with a job description
3. Uploads multiple resumes (PDF, DOC, DOCX)
4. The backend parses each resume and scores it against the JD
5. Candidates are ranked by match score and displayed in a sortable table
6. Recruiter can shortlist, reject, and add notes
7. Export shortlisted candidates as CSV

---

## Architecture

```
hirewise-app/
├── frontend/        # React SPA (CRA)
│   └── src/
│       ├── pages/           # Login, Dashboard, Upload, Results
│       ├── components/
│       │   ├── layout/      # AppShell sidebar + PageHeader
│       │   ├── ui/          # Button, Badge, ScoreBadge, etc.
│       │   └── screening/   # CandidateDrawer
│       ├── lib/             # scorer.js, api.js, auth.js (context)
│       └── data/            # seed.js (demo candidates + sessions)
│
└── backend/         # Node.js + Express
    └── src/
        ├── modules/
        │   ├── auth/        # JWT login/register
        │   ├── resumes/     # Upload + parse (pdf-parse, mammoth)
        │   ├── jobs/        # Job description CRUD
        │   ├── screening/   # Session management + trigger scoring
        │   └── candidates/  # Candidate CRUD, shortlist, notes, export
        ├── lib/
        │   └── scorer.js    # Scoring engine
        ├── middleware/       # Auth (JWT), error handler
        └── database/        # connect.js, seed.js
```

---

## Scoring logic

Each resume is scored against the job description using four weighted factors:

| Factor | Weight | How it's calculated |
|---|---|---|
| Skills match | 50% | Matched skills ÷ total required skills in JD |
| Experience | 25% | Compares extracted years vs JD requirement |
| Education | 15% | Tiered: PhD > Master's > Bachelor's > Associate |
| Keyword similarity | 10% | Jaccard similarity between resume tokens and JD tokens |

**Final score** = (skills × 0.5) + (experience × 0.25) + (education × 0.15) + (keyword × 0.1)

Scores are capped at 99 and floored at 5. A resume missing key skills like React/TypeScript for a frontend role will visibly score lower.

---

## Local setup

### Requirements

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
node src/database/seed.js   # seed demo data
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Open `http://localhost:3000` and sign in with:
- Email: `sarah.chen@acme.co`
- Password: `demo1234`

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default: 4000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs — change this |
| `CLIENT_URL` | Frontend URL for CORS |
| `NODE_ENV` | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

---

## Deployment

**Frontend → Vercel**
- Connect the `/frontend` directory
- Set `REACT_APP_API_URL` to your Render backend URL

**Backend → Render**
- Connect the `/backend` directory
- Set all env vars in Render's dashboard
- Use MongoDB Atlas for the database

---

## Tradeoffs made

- **Frontend demo mode**: The frontend works standalone using seed data so it can be demoed without the backend running. The real backend integration is wired up via `api.js` — just set `REACT_APP_API_URL`.

- **Browser PDF parsing**: PDFs uploaded via the browser can't be parsed as text (they're binary). This is expected — in production, all file parsing happens server-side via `pdf-parse`. The frontend shows a helpful message for this.

- **No real-time updates**: Scoring runs synchronously in the `/screening/:id/run` endpoint. For large batches (50+ resumes), this should be moved to a background queue (BullMQ, etc.).

- **Skill extraction is keyword-based**: The scorer uses a hardcoded list of ~40 tech skills. It works well for software roles but would need expansion or an NLP model for broader hiring use cases.

- **No file storage**: Resume files aren't persisted to disk or S3 — only extracted text is stored in MongoDB. Add multer-s3 or similar if you need to store originals.

---

## Potential improvements

- Background job queue for large resume batches
- OpenAI/Claude API integration for richer candidate summaries
- Multi-user support with organization accounts
- Email notifications when shortlist changes
- Bulk reject / bulk shortlist actions
- Resume file storage (S3)
- More granular skill taxonomy per job category
