# Smart Academic Assistant

Smart Academic Assistant is a simple but professional full-stack PFE web application for:

- homework submission
- AI-supported homework analysis
- simple cheating detection
- teacher dashboard management
- student follow-up and feedback

Project title:

- Smart Academic Assistant - Gestion intelligente des devoirs & detection de triche

## 1. Tech Stack

Frontend:

- React.js
- Bootstrap
- CSS
- CSS Grid

Backend:

- Node.js
- Express.js

Database:

- MySQL

Automation:

- n8n

AI:

- Gemini API inside n8n workflows only

## 2. Main Features

- JWT login for teacher and student
- protected routes
- teacher-created assignments with either in-app questions or an uploaded PDF homework file
- students can answer questions directly, submit text answers, or upload PDF submissions
- professional login screen with a forgot-password recovery panel
- MySQL storage for users, students, submissions, analysis, and notifications
- teacher dashboard with statistics
- student dashboard with history and feedback
- score and feedback storage
- AI verification of answered and missing questions for structured assignments
- AI probability and plagiarism percentage
- teacher review and final note
- n8n-ready webhook integration

## 3. Folder Structure

```text
pfe/
├── backend/
├── frontend/
├── database/
├── uploads/
├── n8n-guide/
├── PROJECT-ARCHITECTURE.md
└── README.md
```

Detailed architecture:

- see `PROJECT-ARCHITECTURE.md`

## 4. Database Files

Files:

- `database/schema.sql`
- `database/sample-data.sql`

Tables:

- `users`
- `students`
- `homework_submissions`
- `homework_assignments`
- `homework_assignment_questions`
- `homework_submission_answers`
- `homework_analysis`
- `notifications`

## 5. Demo Accounts

If you import `database/sample-data.sql`, use:

- Teacher: `teacher@school.com` / `teacher123`
- Student: `student1@school.com` / `student123`
- Student: `student2@school.com` / `student123`

## 6. Run The Full Project In One Command

From the project root:

```bash
npm run install:all
npm run dev
```

`npm run dev` starts the backend and frontend together. It also starts n8n if it is installed and not already running.

Useful URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- n8n: `http://localhost:5678`

If you want to run only the app without starting n8n:

```bash
npm run dev:no-n8n
```

## 7. Backend Setup

Go to backend:

```bash
cd backend
```

Install packages:

```bash
npm install
```

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_academic_assistant
DB_USER=root
DB_PASSWORD=

JWT_SECRET=replace_with_a_long_random_secret

N8N_SHARED_SECRET=replace_with_a_long_random_webhook_secret
N8N_SUBMISSION_WEBHOOK_URL=http://localhost:5678/webhook/smart-academic-assistant
N8N_RESULT_EMAIL_WEBHOOK_URL=
N8N_CHEATING_ALERT_WEBHOOK_URL=
```

Run backend:

```bash
npm run dev
```

Automated structured assignment smoke test:

```bash
npm run test:structured-smoke
```

The smoke test now cleans up its temporary assignments, submissions, and notifications automatically.

If you want to keep the generated test data for inspection:

```bash
set SMOKE_KEEP_DATA=true
npm run test:structured-smoke
```

Backend URL:

- `http://localhost:5000`

## 8. Frontend Setup

Go to frontend:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## 9. Database Setup

1. Open MySQL.
2. Run `database/schema.sql`.
3. Run `database/sample-data.sql`.
4. Start backend.
5. Start frontend.
6. Login with the sample accounts.

## 10. Main Frontend Pages

- Login page
- Teacher dashboard
- Student dashboard
- Submit homework
- Assignments list
- Create question-based or PDF assignment
- Answer questions or submit PDF assignment work
- Homework list
- Homework details
- Feedback page
- Navbar
- Sidebar
- Layout components

## 11. Main Backend Routes

### Auth routes

- `POST /api/auth/register/student`
- `POST /api/auth/register/teacher`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Student routes

- `GET /api/students/profile`
- `GET /api/students/dashboard`

### Homework routes

- `GET /api/homework`
- `GET /api/homework/assignments`
- `GET /api/homework/assignments/:id`
- `POST /api/homework/assignments`
- `PUT /api/homework/assignments/:id/status`
- `DELETE /api/homework/assignments/:id`
- `POST /api/homework/assignments/:id/submit`
- `GET /api/homework/dashboard/teacher`
- `GET /api/homework/:id`
- `POST /api/homework`
- `PUT /api/homework/:id/review`
- `DELETE /api/homework/:id`

### Analysis routes

- `GET /api/analysis/:submissionId`
- `PUT /api/analysis/:submissionId/final-note`

### Notification routes

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`

### n8n webhook routes

- `POST /api/webhooks/n8n/analysis-result`
- `GET /api/webhooks/n8n/weekly-report-data`

## 12. Sample API Examples

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@school.com",
  "password": "teacher123"
}
```

### Student PDF assignment submission

Use `multipart/form-data` with:

- `content` for text submission
- or `file` for PDF upload

Endpoint:

- `POST /api/homework/assignments/:id/submit`

### n8n result callback

```http
POST /api/webhooks/n8n/analysis-result
x-n8n-secret: my_n8n_shared_secret
Content-Type: application/json

{
  "submission_id": 3,
  "score": 16,
  "feedback": "Good structure and relevant content.",
  "grammar_score": 15,
  "structure_score": 17,
  "content_score": 16,
  "answered_questions_count": 3,
  "total_questions_count": 3,
  "missing_questions": [],
  "ai_probability": 18,
  "plagiarism_percentage": 22
}
```

## 13. Simple Plagiarism Detection Logic

The backend includes a simple similarity function in:

- `backend/src/utils/similarity.js`

Logic used:

- normalize text
- split text into words
- compare common words using Jaccard similarity
- return the highest percentage found against existing homework in the same subject

This keeps the project realistic and easy to explain in a PFE.

## 14. Webhook Integration Summary

### Backend to n8n

After homework submission, backend sends:

- submission ID
- title
- subject
- submission type (`classic` or `questionnaire`)
- text content or student submission file URL
- assignment metadata when the submission belongs to a teacher-created assignment
- student info
- plagiarism percentage
- questionnaire instructions and question/answer pairs when the student answers inside the app

### n8n to backend

After Gemini analysis, n8n returns:

- score
- feedback
- grammar score
- structure score
- content score
- answered questions count
- total questions count
- missing questions list
- AI probability
- plagiarism percentage

### Backend after analysis

Backend automatically:

- stores results in MySQL
- updates submission status
- creates notifications
- can trigger result email workflow
- can trigger cheating alert workflow

## 15. n8n Guide

Complete step-by-step workflow guide:

- `n8n-guide/N8N-BEGINNER-GUIDE.md`

Advanced combined workflow guide:

- `n8n-guide/COMBINED-WORKFLOW-GUIDE.md`
- `n8n-guide/workflows/05-smart-academic-assistant-combined-advanced.json`

Covered workflows:

- Homework submission analysis workflow
- PDF assignment submission workflow
- Result email workflow
- Cheating alert workflow
- Weekly teacher summary workflow

## 16. Presentation Tips

For your live demo:

1. Login as student
2. Open a teacher-published assignment
3. Show either question answers or a PDF/text submission sent to n8n
4. Show the teacher dashboard
5. Open homework details
6. Show score, feedback, answered questions count, missing questions, AI probability, plagiarism, and final review

## 17. 5-Minute PFE Demo Explanation

Use this simple explanation during the presentation.

### Testing

For testing, the project uses three tools:

- Vitest for frontend unit tests.
- Vitest and Supertest for backend and API tests.
- Playwright for end-to-end tests.

Frontend tests verify that React UI components render correctly, protected routes redirect users correctly, and authentication state changes after login or logout.

Backend tests verify authentication, role-based access, API responses, assignment publishing, student submission, and n8n webhook callbacks.

End-to-end tests simulate the real user journey: a teacher creates and publishes an assignment, a student submits an answer or PDF, and the system receives correction results from the AI workflow.

### Security

The security layer protects the application from the login page to the API:

- JWT authentication keeps sessions secure after login.
- bcryptjs hashes passwords before storing them.
- React protected routes block pages that require login.
- Backend middleware applies role-based access control.
- Helmet adds HTTP security headers.
- CORS is restricted to the frontend URL.
- Rate limiting protects general API routes and webhook routes.
- Zod validates user input before it reaches business logic.
- MongoDB input sanitization blocks malicious query operators.
- hpp protects against HTTP parameter pollution.
- The n8n callback uses a shared secret in the `x-n8n-secret` header.
- PDF uploads are validated by file type and maximum file size.

### Roles

The platform has three user roles:

- Admin manages users and can access teacher/admin features.
- Teacher uploads PDF assignments, validates AI-extracted questions, publishes assignments, reviews submissions, checks plagiarism or cheating alerts, and sends weekly reports.
- Student views published assignments, submits text or PDF answers, and receives feedback with correction results.

In one sentence: Smart Academic Assistant is a secure academic platform where teachers create assignments, students submit work, and AI/n8n workflows help correct submissions, detect risks, and generate useful feedback.

## 18. Notes

- PDF upload is supported in the app
- text submissions are the easiest option for a live demo
- structured assignments are ideal to demonstrate automatic intelligent correction
- the backend is intentionally simple and modular for student understanding
- Gemini logic stays outside the business code and is handled in n8n

## 19. Verified Locally

What was verified in this workspace:

- backend dependencies installed successfully
- frontend dependencies installed successfully
- backend app loads without syntax errors
- frontend production build completes successfully
