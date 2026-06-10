# Combined Advanced n8n Workflow

This file explains the advanced single-workflow version:

- `n8n-guide/workflows/05-smart-academic-assistant-combined-advanced.json`

## What This Combined Workflow Does

Inside one n8n workflow, it handles:

1. homework submission webhook
2. confirmation email to student
3. homework analysis with Gemini API
4. callback to backend with analysis result
5. result email to student
6. cheating alert email to teacher when needed
7. weekly summary email through a schedule trigger
8. structured assignment analysis with question coverage detection
9. teacher-uploaded PDF assignment submissions

This is still one workflow because n8n supports multiple trigger nodes in the same workflow.

The Gemini prompt is configured to return student-facing feedback in French. That includes `feedback`, `key_strengths`, `improvement_tips`, and `missing_questions`.

## Important Backend Setting

If you use this combined workflow, set these backend `.env` values:

```env
N8N_SUBMISSION_WEBHOOK_URL=http://localhost:5678/webhook/smart-academic-assistant
N8N_RESULT_EMAIL_WEBHOOK_URL=
N8N_CHEATING_ALERT_WEBHOOK_URL=
```

Why:

- the combined workflow already sends the result email
- the combined workflow already sends the cheating alert
- if you keep the other two webhook URLs, you may get duplicate emails

## What Still Needs Configuration

This repo's workflow file is already prepared for the local project setup.

After import, you still need to:

- select a real SMTP credential in the email nodes
- keep `my_n8n_shared_secret` identical in n8n and `backend/.env`
- change `http://localhost:5000` only if your backend runs elsewhere
- update the teacher or sender email only if you want different addresses

## PDF Branch

This combined workflow already includes:

- `Download PDF`
- `Extract Text From PDF`

So PDF homework can go through the same Gemini analysis path after text extraction.

This also covers PDF assignments created by the teacher. In that flow:

- the teacher uploads the homework PDF while creating the assignment
- the student opens the PDF assignment from the React app
- the student submits a text answer, a PDF answer, or both
- the backend sends the student submission to n8n with the usual `fileUrl` when a PDF answer exists
- the backend also includes an `assignment` object with the teacher PDF metadata:
  - `type = pdf`
  - `fileName`
  - `fileUrl`
  - `instructions`

n8n should analyze the student submission. The teacher PDF metadata is included as context for future workflow improvements, but the existing PDF extraction branch only needs the student submission `fileUrl`.

## Structured Assignment Branch

The same workflow also supports structured assignments where:

- the teacher creates one homework with multiple questions
- the student answers each question directly in the React app
- the backend sends `submissionType = questionnaire`
- the backend also sends a `questionnaire` object with:
  - `instructions`
  - `questions[]`
  - `questionText`
  - `answerText`

Gemini then returns the usual evaluation plus:

- `answered_questions_count`
- `total_questions_count`
- `missing_questions`

These values are saved in MySQL and shown in the homework details page so the teacher can see if some questions were skipped.

## Recommended Gemini Model

Use one current Gemini text model that supports `generateContent` and structured JSON output.

Examples shown in Google docs around March 2026 include:

- `gemini-2.5-flash`
- `gemini-3-flash-preview`

Keep the workflow model placeholder simple:

- replace only `GEMINI_MODEL_HERE`

## Import Steps

1. Open n8n.
2. Click the top-right workflow menu.
3. Choose `Import from File`.
4. Select `05-smart-academic-assistant-combined-advanced.json`.
5. Save the workflow.
6. Configure email credentials for the email nodes.
7. Save again after selecting credentials.
8. Test with one text homework first.
9. Test with one PDF homework.
10. Test one structured assignment with complete answers.
11. Test one structured assignment with missing answers.
12. Test the weekly summary branch manually before activating the workflow.

If you skip the SMTP credential step, the workflow can still analyze homework and save the result in the backend, but the execution will show email node credential errors.

## Suggested Test Order

1. Submit one text homework from your app.
2. Confirm the student receives the confirmation email.
3. Check Gemini result in n8n execution.
4. Confirm backend stores the result.
5. Confirm result email is sent.
6. Submit one structured assignment with all questions answered and confirm `answered_questions_count` is correct.
7. Submit one structured assignment with empty answers and confirm `missing_questions` is filled.
8. Submit a suspicious homework to trigger cheating alert.
9. Run the weekly branch manually from n8n.
