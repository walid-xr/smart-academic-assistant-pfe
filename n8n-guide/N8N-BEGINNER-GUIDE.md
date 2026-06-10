# n8n Beginner Guide For Smart Academic Assistant

This guide explains how to build the n8n workflows yourself for the project:

- Smart Academic Assistant - Gestion intelligente des devoirs & detection de triche

The backend is already prepared to:

- send homework data to n8n
- receive analysis results back from n8n
- trigger email workflows through n8n
- provide weekly report data to n8n

Important rule for this project:

- Gemini API is used inside n8n
- React frontend does not call Gemini directly
- Express backend does not call Gemini directly

## 1. Before You Start

You need:

- the backend running on `http://localhost:5000`
- n8n running on your machine
- a Gemini API key from Google AI Studio
- an email method inside n8n for sending emails

If your n8n instance is on another machine or in Docker, do not keep `SERVER_URL=http://localhost:5000` in backend `.env`.

Use a URL that n8n can really access, for example:

- `http://192.168.1.10:5000`
- or a public URL if needed

## 2. Important Backend Endpoints

### Backend sends homework to n8n

Backend calls the webhook URL stored in:

- `N8N_SUBMISSION_WEBHOOK_URL`

Example payload sent from backend to n8n:

```json
{
  "submissionId": 12,
  "title": "Algorithm Homework",
  "subject": "Algorithms",
  "content": "This homework explains the difference between stack and queue...",
  "filePath": null,
  "fileUrl": null,
  "submissionDate": "2026-03-25T10:30:00.000Z",
  "plagiarismPercentage": 24.5,
  "student": {
    "id": 1,
    "name": "Youssef Benali",
    "email": "student1@school.com",
    "className": "GI-2"
  }
}
```

### n8n sends analysis result back to backend

Endpoint:

- `POST http://localhost:5000/api/webhooks/n8n/analysis-result`

Header:

- `x-n8n-secret: your_shared_secret`

Body example:

```json
{
  "submission_id": 12,
  "score": 15.5,
  "feedback": "Bon travail dans l ensemble. Ajoute plus d exemples detailles.",
  "grammar_score": 16,
  "structure_score": 15,
  "content_score": 15.5,
  "ai_probability": 22,
  "plagiarism_percentage": 24.5
}
```

### n8n gets weekly report data from backend

Endpoint:

- `GET http://localhost:5000/api/webhooks/n8n/weekly-report-data`

Header:

- `x-n8n-secret: your_shared_secret`

## 3. Gemini API Request Basics

As of March 23, 2026, the official Gemini REST documentation shows:

- use the `generateContent` endpoint
- send your API key in the `x-goog-api-key` header
- the API reference examples show `gemini-2.5-flash`
- the text generation guide also shows `gemini-3-flash-preview`

So in n8n, your HTTP Request node can use:

- Method: `POST`
- URL: `https://generativelanguage.googleapis.com/v1beta/models/<GEMINI_MODEL>:generateContent`

Headers:

- `x-goog-api-key: YOUR_GEMINI_API_KEY`
- `Content-Type: application/json`

For a student PFE, the simplest choice is:

- pick one current text-generation model visible in your Google AI documentation or AI Studio account
- put that exact model name in `<GEMINI_MODEL>`
- keep the rest of the workflow unchanged

Basic request structure:

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ]
}
```

## 4. Workflow 1 - Homework Submission Analysis Workflow

### Workflow name

- `Homework Submission Analysis`

### Goal

When a student submits homework, n8n receives the data, prepares the text, sends it to Gemini, and returns the result to the backend.

### Trigger node

- `Webhook`

### Webhook node configuration

- HTTP Method: `POST`
- Path: `homework-submission`
- Authentication: use header auth if you want extra protection
- Respond: `Immediately`
- Response Code: `200`
- Response Data: custom JSON like:

```json
{
  "received": true,
  "message": "Homework received by n8n"
}
```

Using `Respond: Immediately` is useful because the backend only needs a quick confirmation. The Gemini analysis can continue in the workflow after that.

### Next nodes

Use these nodes in this order:

1. `Webhook`
2. `Set` - normalize useful fields
3. `IF` - check if this is a PDF submission or text submission
4. Text branch:
   - `Set` - create `textToAnalyze` from `content`
5. PDF branch:
   - `HTTP Request` - download the PDF from `fileUrl`
   - `Extract From File` - operation `Extract From PDF`
   - `Set` - create `textToAnalyze` from extracted PDF text
6. `HTTP Request` - call Gemini API
7. `Code` - clean and parse Gemini JSON text
8. `Set` - prepare backend result payload
9. `HTTP Request` - send result back to backend

### What each node does

#### 1. Webhook

Receives the submission sent by the backend.

#### 2. Set

Keep only the fields you need, for example:

- `submissionId`
- `title`
- `subject`
- `content`
- `fileUrl`
- `studentName`
- `studentEmail`
- `plagiarismPercentage`

This makes the rest of the workflow cleaner.

#### 3. IF

Condition:

- if `fileUrl` exists, go to PDF branch
- otherwise go to text branch

#### 4. Text branch Set node

Create a field called `textToAnalyze` with value:

```text
{{$json.content}}
```

#### 5. PDF branch

##### HTTP Request - Download PDF

- Method: `GET`
- URL: `{{$json.fileUrl}}`
- Response: download as file or binary

##### Extract From File

- Operation: `Extract From PDF`
- Input Binary Field: the binary field from the previous node, usually `data`

This node converts the PDF into text.

##### Set node after Extract From File

Create:

- `textToAnalyze`

Put inside it the extracted text from the previous node.

Use the exact output field name shown by your Extract From File node.

### Prompt sent to Gemini

Use a prompt like this in the Gemini HTTP Request node:

```text
You are an academic assistant for a student homework platform.

Analyze the homework below and return JSON only.
Do not add markdown.
Do not add explanation outside JSON.
Write the student feedback in French.

Required JSON format:
{
  "score": 0,
  "feedback": "",
  "grammar_score": 0,
  "structure_score": 0,
  "content_score": 0,
  "ai_probability": 0
}

Rules:
- score must be a number from 0 to 20
- grammar_score must be a number from 0 to 20
- structure_score must be a number from 0 to 20
- content_score must be a number from 0 to 20
- ai_probability must be a number from 0 to 100
- feedback must be simple, clear, useful for a student, and written in French

Homework title: {{$json.title}}
Subject: {{$json.subject}}
Student name: {{$json.studentName}}

Homework text:
{{$json.textToAnalyze}}
```

### Gemini HTTP Request node body

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "PUT_THE_PROMPT_HERE"
        }
      ]
    }
  ]
}
```

In n8n, the `text` value should be an expression containing your full prompt.

### Expected Gemini response format

Gemini usually returns data like:

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "{\"score\":15,\"feedback\":\"Bon travail\",\"grammar_score\":16,\"structure_score\":14,\"content_score\":15,\"ai_probability\":20}"
          }
        ]
      }
    }
  ]
}
```

### Code node to parse Gemini response

Use a simple Code node:

```javascript
const raw = $json.candidates[0].content.parts[0].text || '';
const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
const parsed = JSON.parse(cleaned);

return [
  {
    json: parsed
  }
];
```

### Set node before sending back to backend

Build this structure:

```json
{
  "submission_id": "{{$node['Set'].json['submissionId']}}",
  "score": "{{$json.score}}",
  "feedback": "{{$json.feedback}}",
  "grammar_score": "{{$json.grammar_score}}",
  "structure_score": "{{$json.structure_score}}",
  "content_score": "{{$json.content_score}}",
  "ai_probability": "{{$json.ai_probability}}",
  "plagiarism_percentage": "{{$node['Set'].json['plagiarismPercentage']}}"
}
```

Use the correct node names from your own workflow. The idea is:

- keep the original submission values
- merge them with the Gemini result

### HTTP Request node to send result back to backend

- Method: `POST`
- URL: `http://localhost:5000/api/webhooks/n8n/analysis-result`
- Headers:
  - `Content-Type: application/json`
  - `x-n8n-secret: your_shared_secret`
- Body: JSON

### How to test workflow 1

1. Open the workflow in n8n.
2. Click `Listen for test event` on the Webhook node.
3. Submit homework from the React app.
4. Check the workflow execution.
5. Confirm the backend updates:
   - `homework_submissions.status` becomes `analyzed`
   - `homework_analysis` gets score and feedback
6. Open the teacher dashboard and homework details page.

### Common errors and fixes

#### Error: 401 from backend webhook

Cause:

- missing or wrong `x-n8n-secret`

Fix:

- make sure backend `.env` and n8n header use the same secret

#### Error: JSON parse fails in Code node

Cause:

- Gemini returned markdown or extra text

Fix:

- strengthen the prompt with `return JSON only`
- keep the cleanup code that removes ```json blocks

#### Error: PDF branch returns empty text

Cause:

- PDF download failed
- wrong binary field name
- scanned PDF with no selectable text

Fix:

- test the `fileUrl` directly in your browser
- check the binary field name in n8n
- use text submissions for first demo if the PDF is image-based

#### Error: n8n cannot access `localhost:5000`

Cause:

- n8n is not running on the same host as the backend

Fix:

- replace `localhost` with a reachable IP or public URL

## 5. Workflow 2 - Result Email Workflow

### Workflow name

- `Homework Result Email`

### Goal

Send the score and feedback to the student after backend stores the analysis result.

### Trigger node

- `Webhook`

Backend calls the URL stored in:

- `N8N_RESULT_EMAIL_WEBHOOK_URL`

### Payload sent by backend

```json
{
  "submissionId": 12,
  "title": "Algorithm Homework",
  "subject": "Algorithms",
  "studentName": "Youssef Benali",
  "studentEmail": "student1@school.com",
  "score": 15.5,
  "feedback": "Bon travail dans l ensemble. Ajoute plus d exemples pour renforcer ta reponse.",
  "cheatingFlag": false
}
```

### Next nodes

1. `Webhook`
2. `Set` - format email subject and message
3. `Send Email`

### What each node does

#### Webhook

Receives the email data from backend.

#### Set

Prepare fields like:

- `to`
- `subject`
- `text`
- `html`

Example email subject:

```text
Resultat du devoir - {{$json.title}}
```

Example email body:

```text
Bonjour {{$json.studentName}},

Votre devoir "{{$json.title}}" a ete analyse.

Note : {{$json.score}} / 20
Feedback : {{$json.feedback}}

Merci.
```

#### Send Email

Use your configured email account.

Suggested fields:

- To Email: `{{$json.studentEmail}}`
- Subject: `{{$json.subject}}`
- Text or HTML body: from your Set node

### How to test workflow 2

1. Click `Listen for test event`.
2. Use Postman or n8n test JSON to call the webhook manually.
3. Confirm the student email is received.
4. Trigger it again by finishing Workflow 1 end-to-end.

### Common errors and fixes

#### Error: email not sent

Cause:

- SMTP or email credentials not configured

Fix:

- recheck the Send Email credentials inside n8n

#### Error: empty email body

Cause:

- wrong field names in expressions

Fix:

- open the execution data and confirm the JSON field names

## 6. Workflow 3 - Cheating Alert Workflow

### Workflow name

- `Cheating Alert Email`

### Goal

Send an alert email to the teacher when backend marks a submission as suspicious.

### Trigger node

- `Webhook`

Backend calls the URL stored in:

- `N8N_CHEATING_ALERT_WEBHOOK_URL`

### Payload sent by backend

```json
{
  "submissionId": 12,
  "title": "Algorithm Homework",
  "subject": "Algorithms",
  "studentName": "Youssef Benali",
  "studentEmail": "student1@school.com",
  "aiProbability": 81,
  "plagiarismPercentage": 67,
  "teacherEmails": ["teacher@school.com"]
}
```

### Next nodes

1. `Webhook`
2. `IF` - optional safety check
3. `Set` - prepare teacher alert message
4. `Send Email`

### What each node does

#### IF

Optional condition:

- if `aiProbability >= 70`
- or `plagiarismPercentage >= 60`

This adds one more check before sending the alert.

#### Set

Prepare fields:

- teacher email
- alert subject
- alert message

Example subject:

```text
Cheating alert - {{$json.title}}
```

Example body:

```text
Teacher alert:

A homework submission has been flagged.

Student: {{$json.studentName}}
Subject: {{$json.subject}}
Homework: {{$json.title}}
AI probability: {{$json.aiProbability}}%
Plagiarism percentage: {{$json.plagiarismPercentage}}%
```

#### Send Email

Use:

- To Email: first teacher email or a fixed teacher email

If you want multiple recipients, use a comma-separated email list or loop over `teacherEmails`.

### How to test workflow 3

1. Click `Listen for test event`.
2. Send the sample payload manually.
3. Confirm teacher email is sent.
4. Then test a real flagged analysis from Workflow 1.

### Common errors and fixes

#### Error: no alert email even for suspicious homework

Cause:

- thresholds in IF node are too high
- field names do not match backend payload

Fix:

- compare the IF condition with the real webhook execution JSON

## 7. Workflow 4 - Weekly Teacher Summary Workflow

### Workflow name

- `Weekly Teacher Summary`

### Goal

Every week, collect summary statistics from the backend and send them to the teacher by email.

### Trigger node

- `Schedule Trigger`

### Schedule Trigger configuration

Suggested setup:

- Trigger Interval: `Weeks`
- Weeks Between Triggers: `1`
- Trigger on Weekdays: `Monday`
- Trigger at Hour: `9`
- Trigger at Minute: `0`

Important:

- check your n8n workflow timezone
- use your local timezone for presentation and demo

### Next nodes

1. `Schedule Trigger`
2. `HTTP Request` - get report data from backend
3. `Set` - prepare readable email body
4. `Send Email`

### HTTP Request node to backend

- Method: `GET`
- URL: `http://localhost:5000/api/webhooks/n8n/weekly-report-data`
- Headers:
  - `x-n8n-secret: your_shared_secret`

### Expected backend response

```json
{
  "generated_at": "2026-03-25T11:00:00.000Z",
  "period": "Last 7 days",
  "overview": {
    "total_submissions": 8,
    "average_score": 14.9,
    "flagged_homework": 2
  },
  "flagged_submissions": [
    {
      "submission_id": 12,
      "title": "Algorithm Homework",
      "subject": "Algorithms",
      "student_name": "Youssef Benali",
      "score": 15.5,
      "ai_probability": 81,
      "plagiarism_percentage": 67
    }
  ]
}
```

### Set node for email body

Create a readable message such as:

```text
Weekly Teacher Summary

Period: {{$json.period}}
Total submissions: {{$json.overview.total_submissions}}
Average score: {{$json.overview.average_score}}
Flagged homework: {{$json.overview.flagged_homework}}
Generated at: {{$json.generated_at}}
```

If you want a richer email, add the flagged list manually in HTML format.

### Send Email node

- To Email: teacher email
- Subject: `Weekly homework summary`
- Body: summary from Set node

### How to test workflow 4

1. Do not wait a full week.
2. Click `Execute Workflow` manually.
3. Confirm the HTTP Request returns backend data.
4. Confirm the email is sent.
5. After test success, activate the workflow.

### Common errors and fixes

#### Error: workflow does not run automatically

Cause:

- workflow is not active
- timezone is wrong

Fix:

- activate the workflow
- check workflow timezone and server timezone

#### Error: report numbers are all zero

Cause:

- database has no rows in the last 7 days

Fix:

- insert recent sample data or create test submissions

## 8. Recommended Testing Order

Use this order to avoid confusion:

1. Test backend alone with Postman
2. Test Workflow 1 with a manual sample payload
3. Test Workflow 1 from the real frontend submission
4. Test Workflow 2 with a manual payload
5. Test Workflow 3 with a manual payload
6. Test Workflow 4 manually
7. Activate the workflows only after all manual tests work

## 9. Useful Tips For Your PFE Demo

- Start with a student login
- Submit a text homework first because it is easiest to demo live
- Show the teacher dashboard before and after analysis
- Open the homework details page to show score, feedback, AI probability, and plagiarism
- Explain that n8n is the automation layer between your backend and Gemini
- Explain that the backend remains clean because AI logic is not mixed into the business code

## 10. Official References

Official docs used for this guide:

- Gemini API reference: https://ai.google.dev/api
- Gemini text generation docs: https://ai.google.dev/gemini-api/docs/text-generation
- n8n Webhook node docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- n8n HTTP Request node docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- n8n Extract From File node docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.extractfromfile/
- n8n Send Email node docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.sendemail/
- n8n Schedule Trigger docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/
