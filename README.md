# HireWise - AI-Powered Automated Resume Screening Platform

## Project Overview
**HireWise** is a full-stack, AI-powered web application designed to streamline the recruitment process. It serves as an internal tool allowing HR professionals and recruiters to upload a job description alongside a batch of candidate resumes (PDF, DOC, DOCX) and automatically extracts, analyzes, and ranks the candidates.

### Objective
To reduce manual effort in reviewing hundreds of resumes by providing an automated, unbiased, and highly customizable screening pipeline that scores candidates in real-time.

---

## Key Features & Workflow
* **Recruiter Workflow**: The recruiter logs in, creates a screening session with a job description, and uploads multiple resumes.
* **Automated Parsing**: Uses NLP techniques via `pdf-parse` and `mammoth` to extract text from candidate resumes on the backend.
* **Intelligent Scoring Engine**: Compares extracted candidate data against the required Job Description (JD) and ranks candidates by match score.
* **Calibratable Weights**: Recruiters can dynamically adjust the importance of Technical Skills, Experience, Education, and Keywords, with instant ranking updates.
* **Candidate Management**:
   * Manually inject candidate profiles or edit existing ones.
   * Shortlist, reject, and leave private notes on specific candidates.
   * "One-click Email" integration for shortlisted candidates.
* **Premium UI/UX**: Features a polished, responsive interface with a system-wide Dark Mode, built using raw CSS variables (`color-mix` for auto-theming).
* **Data Export**: Easily export the screened/shortlisted candidate list to CSV or Excel.

---

## Intelligent Scoring Logic
Each resume is scored against the job description using four weighted factors:

| Factor | Weight | Calculation Method |
|---|---|---|
| **Skills match** | 50% | Matched skills ÷ total required skills in JD |
| **Experience** | 25% | Compares extracted years vs JD requirement |
| **Education** | 15% | Tiered: PhD > Master's > Bachelor's > Associate |
| **Keyword similarity** | 10% | Jaccard similarity between resume tokens and JD tokens |

**Final score** = (skills × 0.5) + (experience × 0.25) + (education × 0.15) + (keyword × 0.1)

Scores are capped at 99 and floored at 5.

---

## Technology Stack
### Frontend
* **Framework**: React.js (Single Page Application)
* **Routing & State**: React Router DOM, Context API & Session Storage
* **Styling**: Vanilla CSS with dynamic CSS Variables
* **Icons & Export**: Lucide React, PapaParse (CSV), SheetJS/XLSX (Excel)

### Backend
* **Runtime & Framework**: Node.js with Express.js
* **Database**: MongoDB (via Mongoose ORM)
* **Authentication**: JWT (JSON Web Tokens) & bcrypt
* **File Uploads & Parsing**: Multer, `pdf-parse` (PDFs), `mammoth` (Word docs)

---

## System Architecture
1. **Client Tier (Frontend)**: The user logs into the dashboard, creates a pipeline, and uploads files, which are sent to the backend as `multipart/form-data`.
2. **Application Tier (Backend API)**: Express receives files via Multer. The parsing engine extracts raw text and uses Regex/Heuristics to identify candidate details (names, emails, phones, experience, skills). The scoring engine then calculates the match percentage.
3. **Data Tier (MongoDB)**: Parsed candidates, session data, and job descriptions are stored persistently in MongoDB Atlas. Original files are not stored on disk; only extracted text is saved.

### Folder Structure
```text
hirewise-app/
├── frontend/        # React SPA
│   └── src/
│       ├── components/     # Reusable UI (AppShell, Buttons, CandidateDrawer)
│       ├── data/           # Mock demo seed data
│       ├── lib/            # Axios API config, Auth Context, scorer.js
│       ├── pages/          # Full page views (Login, Dashboard, Upload, Results)
│       └── index.css       # Global styles and Dark Mode variables
└── backend/         # Node.js + Express
    └── src/
        ├── modules/        # Domain-specific logic (auth, resumes, jobs, screening, candidates)
        ├── lib/            # Scoring engine
        ├── middleware/     # JWT verification, Multer, error handler
        └── database/       # Mongoose models, connection, and seed script
