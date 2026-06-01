#  HireWise - Comprehensive Project Documentation

## 1. Abstract & Introduction
**HireWise** is an AI-powered, full-stack recruitment application designed to automate and simplify the resume screening process for HR professionals. In the modern hiring landscape, recruiters receive hundreds of resumes for a single role. HireWise solves this bottleneck by parsing uploaded resumes (PDF/Word), evaluating them against job requirements, and outputting ranked candidates in a highly intuitive, glassmorphic dashboard.

---

## 2. Core Modules & Functionalities

### 2.1. Secure Authentication & Authorization Engine
* **Stateless JWT Sessions:** Implements industry-standard JSON Web Tokens (JWT) for secure, stateless user sessions.
* **Role-based Access:** Differentiates functionality depending on the logged-in user. 
* **Password Cryptography:** Employs `bcrypt.js` with salting to irreversibly hash passwords before saving them to the MongoDB database.
* **Dynamic Login/Signup Flow:** A sleek, single-page authentication flow that allows seamless toggling between registering a new account and logging into an existing one.

### 2.2. Intelligent Resume Processing Engine
* **Multi-format Support:** Uses `pdf-parse` for PDF documents and `mammoth` for Word (`.docx`) files to accurately extract text data, ignoring complex formatting.
* **Automated Candidate Scoring:** The backend algorithms read the parsed text and calculate a match percentage/score based on defined job criteria, skills, and experience.
* **Bulk Uploads:** Supports `multipart/form-data` uploads via `multer`, allowing recruiters to drag-and-drop multiple resumes at once.

### 2.3. Job Pipeline & Session Management
* **Modular Pipelines:** Recruiters can initialize "Active Pipelines" for different open roles (e.g., "Senior Backend Engineer", "Product Manager").
* **Isolated Data Environments:** Each pipeline maintains its own isolated database relationship, ensuring that candidates and resumes are strictly tied to the role they applied for.
* **Status Tracking:** Candidates can be moved through different recruitment stages (e.g., "New", "Shortlisted", "Rejected").

### 2.4. Real-time UI & Data Visualization
* **Dynamic Theme Generation:** Utilizes CSS variables (Custom Properties) to let users toggle between Dark Mode and Light Mode, and change the app's accent colors on the fly.
* **Glassmorphism Aesthetic:** Employs CSS `backdrop-filter` and semi-transparent `color-mix()` rules to create a premium, frosted-glass interface that elevates the user experience.
* **Headless Data Tables:** Uses `@tanstack/react-table` to render massive lists of candidates efficiently, supporting built-in pagination, sorting, and filtering without performance degradation.
* **Data Export:** Recruiters can export their candidate data directly to Excel/CSV utilizing `papaparse` and `xlsx`.

---

## 3. Technology Stack

HireWise is built on the highly scalable **MERN** stack (MongoDB, Express, React, Node.js). 

### Frontend Ecosystem
* **Core Framework:** React.js 18 (Bootstrapped via Create React App)
* **Routing:** `react-router-dom` (v6) for Client-side Routing (SPA).
* **State Management:** React Hooks (useState, useEffect, useContext) for localized state, and Context API for global authentication state.
* **Form Handling:** `react-hook-form` to manage complex form states and perform client-side validation without unnecessary re-renders.
* **Styling & UI:** 
  * Vanilla CSS for global design tokens and theming.
  * `tailwindcss` for utility-driven, responsive layouts.
  * `lucide-react` for modern, scalable SVG icons.
* **HTTP Client:** `axios` configured with interceptors to automatically attach JWT tokens to outgoing requests.

### Backend Ecosystem
* **Runtime Environment:** Node.js
* **API Framework:** `express.js` for robust, modular RESTful routing.
* **Database Management:** MongoDB, mapped using the `mongoose` Object Data Modeling (ODM) library.
* **Security & Auth:** `jsonwebtoken` (JWT), `bcryptjs`.
* **File Handling:** `multer` (File system buffering).
* **Data Extraction:** `pdf-parse` (PDF processing), `mammoth` (Word doc processing).
* **Middleware:** `cors` (Cross-Origin Resource Sharing), `morgan` (HTTP request logging), and `express-validator` (Schema validation).

---

## 4. System Architecture

The application follows a standard Client-Server decoupled architecture:

1. **Presentation Layer (React):** Renders the UI and sends asynchronous HTTP requests using Axios.
2. **Business Logic Layer (Express):** Receives requests, validates payloads, parses files, calculates candidate scores, and enforces authorization rules.
3. **Data Access Layer (Mongoose):** Manages read/write operations to the database.
4. **Storage Layer (MongoDB):** Non-relational NoSQL database holding Collections for `Users`, `Jobs`, `Sessions`, and `Candidates`.

---

## 5. API Endpoints Reference

###  Authentication (`/api/auth`)
* `POST /api/auth/register` - Registers a new user account.
* `POST /api/auth/login` - Authenticates a user and returns a JWT.
* `GET /api/auth/me` - Validates the token and returns the current user profile.

###  Jobs (`/api/jobs`)
* `GET /api/jobs` - Retrieves all jobs associated with the logged-in user.
* `POST /api/jobs` - Creates a new job pipeline/role.

###  Resumes & Screening (`/api/screening`)
* `POST /api/screening` - Initializes a new screening session linked to a specific Job ID.
* `POST /api/resumes/upload` - Endpoint accepting `multipart/form-data` to process and parse uploaded resumes.

###  Candidates (`/api/candidates`)
* `GET /api/candidates/:sessionId` - Fetches all candidates processed in a specific pipeline.
* `PUT /api/candidates/:id` - Updates candidate status (e.g., shortlisting).

---

## 6. Setup and Installation Instructions

### Prerequisites
* Node.js (v16+)
* MongoDB (Running locally on `mongodb://localhost:27017` or a MongoDB Atlas URI)
* Git (for cloning the repository)

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the backend root and configure it:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/hirewise
   JWT_SECRET=your_super_secret_key
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```
4. Start the backend development server: `npm run dev`

### Step 2: Frontend Setup
1. Open a new terminal and navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the frontend root (optional, defaults to `localhost:4000`):
   ```env
   REACT_APP_API_URL=http://localhost:4000/api
   ```
4. Start the React development server: `npm start`
5. The application will automatically open in your browser at `http://localhost:3000`.

---

## 7. Future Scope & Enhancements

While HireWise is fully functional, future iterations could include:
1. **LLM Integration (OpenAI/Gemini):** Passing parsed resume data to an LLM to generate natural language summaries of a candidate's strengths and weaknesses.
2. **Email Integration:** Automatically emailing candidates regarding their application status (e.g., using SendGrid or Nodemailer).
3. **Advanced Analytics Dashboard:** Visualizing recruitment metrics (e.g., time-to-hire, drop-off rates) using `recharts` or `chart.js`.
4. **Cloud Storage:** Offloading uploaded PDF files to an AWS S3 bucket instead of local memory for permanent archiving and easier distribution.

---

## 8. Contributing

Contributions are always welcome! If you'd like to improve the project:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

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
