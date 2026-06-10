# Smart Academic Assistant - Project Architecture

## 1. Project Vision

This project is a realistic PFE web application for managing homework submissions, AI-supported analysis, and simple cheating detection.

Main users:

- Teacher/Admin
- Student

Main idea:

- Students submit homework as text or PDF
- Backend stores the homework in MySQL
- Backend sends submission data to n8n through a webhook
- n8n calls Gemini API for analysis
- n8n sends the result back to the backend
- Teacher reviews results from a professional dashboard

## 2. Main Folders

```text
pfe/
├── backend/
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── styles/
├── database/
│   ├── schema.sql
│   └── sample-data.sql
├── uploads/
│   └── homework/
├── n8n-guide/
│   └── N8N-BEGINNER-GUIDE.md
└── README.md
```

## 3. Application Layers

### Frontend

- React.js for pages and routing
- Bootstrap for ready-made UI components
- Plain CSS for custom styling
- CSS Grid for dashboard and card layouts

### Backend

- Node.js with Express.js
- JWT authentication
- REST API
- File upload with `multer`
- Outgoing webhook support for n8n
- Incoming webhook endpoints for analysis results

### Database

- MySQL
- Separate tables for users, students, submissions, analysis, and notifications

### Automation

- n8n handles workflow automation
- Gemini API is used only inside n8n
- Backend never calls Gemini directly

## 4. Main Data Flow

### Homework submission flow

1. Student logs in
2. Student submits text or PDF
3. Backend stores the submission in MySQL
4. Backend calculates a simple plagiarism percentage for text submissions
5. Backend sends submission data to n8n webhook
6. n8n analyzes the homework with Gemini API
7. n8n sends the analysis result back to backend webhook
8. Backend updates `homework_analysis` and `homework_submissions`
9. Teacher sees results in dashboard

### Cheating detection flow

1. Backend compares submission text with previous homework texts
2. Gemini workflow returns `ai_probability`
3. Backend combines plagiarism score and AI probability
4. Backend sets `cheating_flag`
5. Backend can trigger another n8n webhook for alert emails

## 5. Why This Architecture Is Good For A PFE

- Professional enough for demo and presentation
- Not too difficult for a 2-month student project
- Clear separation between frontend, backend, database, and automation
- Easy to explain live during presentation
- Realistic business value for schools and teachers

