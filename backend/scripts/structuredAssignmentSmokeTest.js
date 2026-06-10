const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mysql = require('mysql2/promise');

const API_URL = process.env.SMOKE_API_URL || 'http://localhost:5000/api';
const ANALYSIS_TIMEOUT_MS = Number(process.env.SMOKE_ANALYSIS_TIMEOUT_MS || 40000);
const POLL_INTERVAL_MS = Number(process.env.SMOKE_POLL_INTERVAL_MS || 3000);
const KEEP_DATA = process.env.SMOKE_KEEP_DATA === 'true';
const RUN_ID = Date.now();

const assignmentOne = {
  title: `Quiz Test AI ${RUN_ID}`,
  subject: 'React',
  instructions: 'Answer all questions directly in the application.',
  questions: [
    'What is React?',
    'What is the role of components?',
    'Why is state important in a web application?'
  ]
};

const assignmentTwo = {
  title: `Quiz Test Missing Answers ${RUN_ID}`,
  subject: 'React',
  instructions: 'Answer every question clearly.',
  questions: ['Define React.', 'What is JSX?', 'What is state?']
};

const classicHomework = {
  title: `Classic Smoke Homework ${RUN_ID}`,
  subject: 'React',
  content:
    'React helps developers build interactive user interfaces using reusable components. State is useful because it stores changing values and allows the interface to update when the data changes.'
};

const demoUsers = {
  teacher: {
    email: 'teacher@school.com',
    password: 'teacher123'
  },
  student1: {
    email: 'student1@school.com',
    password: 'student123'
  },
  student2: {
    email: 'student2@school.com',
    password: 'student123'
  }
};

const log = (message) => {
  console.log(`[structured-smoke] ${message}`);
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createClient = (token = null) =>
  axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

const login = async ({ email, password }) => {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    { email, password },
    {
      timeout: 15000
    }
  );

  assert(response.data?.token, `Login failed for ${email}`);
  return response.data.token;
};

const waitForAnalysis = async (client, submissionId, label) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < ANALYSIS_TIMEOUT_MS) {
    const response = await client.get(`/homework/${submissionId}`);
    const submission = response.data;

    if (submission.status === 'analyzed') {
      return submission;
    }

    log(`${label}: current status is "${submission.status}", waiting...`);
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`${label}: analysis timeout after ${ANALYSIS_TIMEOUT_MS}ms`);
};

const createAssignment = async (client, payload, label) => {
  log(`${label}: creating assignment "${payload.title}"`);
  const response = await client.post('/homework/assignments', payload);
  assert(response.data?.assignment?.id, `${label}: assignment was not created`);
  return response.data.assignment;
};

const getAssignmentDetails = async (client, assignmentId, label) => {
  const response = await client.get(`/homework/assignments/${assignmentId}`);
  assert(Array.isArray(response.data?.questions), `${label}: questions not returned`);
  return response.data;
};

const submitAssignmentAnswers = async (client, assignmentId, answers, label) => {
  log(`${label}: submitting questionnaire answers`);
  const response = await client.post(`/homework/assignments/${assignmentId}/submit`, { answers });
  assert(response.data?.submission?.id, `${label}: submission was not created`);
  return response.data.submission;
};

const deleteAssignment = async (client, assignmentId) => {
  await client.delete(`/homework/assignments/${assignmentId}`);
};

const deleteHomework = async (client, submissionId) => {
  await client.delete(`/homework/${submissionId}`);
};

const deleteNotificationsByTitles = async (titles) => {
  const envPath = path.join(__dirname, '../.env');
  const env = Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      })
  );

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  try {
    for (const title of titles.filter(Boolean)) {
      await connection.query(
        `DELETE FROM notifications
         WHERE message LIKE ?`,
        [`%${title}%`]
      );
    }
  } finally {
    await connection.end();
  }
};

const cleanupArtifacts = async ({ teacherClient, assignmentIds, homeworkIds, notificationTitles }) => {
  if (KEEP_DATA) {
    log('Cleanup skipped because SMOKE_KEEP_DATA=true');
    return;
  }

  for (const submissionId of homeworkIds.filter(Boolean).reverse()) {
    try {
      await deleteHomework(teacherClient, submissionId);
      log(`cleanup: deleted homework submission ${submissionId}`);
    } catch (error) {
      log(`cleanup: could not delete homework submission ${submissionId}`);
    }
  }

  for (const assignmentId of assignmentIds.filter(Boolean).reverse()) {
    try {
      await deleteAssignment(teacherClient, assignmentId);
      log(`cleanup: deleted assignment ${assignmentId}`);
    } catch (error) {
      log(`cleanup: could not delete assignment ${assignmentId}`);
    }
  }

  try {
    await deleteNotificationsByTitles(notificationTitles);
    log('cleanup: deleted smoke-test notifications');
  } catch (error) {
    log('cleanup: could not delete smoke-test notifications');
  }
};

const run = async () => {
  const cleanupState = {
    teacherClient: null,
    assignmentIds: [],
    homeworkIds: [],
    notificationTitles: []
  };

  try {
    log(`API base: ${API_URL}`);

    const teacherToken = await login(demoUsers.teacher);
    const student1Token = await login(demoUsers.student1);
    const student2Token = await login(demoUsers.student2);

    const teacherClient = createClient(teacherToken);
    const student1Client = createClient(student1Token);
    const student2Client = createClient(student2Token);

    cleanupState.teacherClient = teacherClient;

    log('All demo accounts logged in successfully');

    const createdAssignmentOne = await createAssignment(
      teacherClient,
      assignmentOne,
      'main-flow'
    );
    cleanupState.assignmentIds.push(createdAssignmentOne.id);
    cleanupState.notificationTitles.push(createdAssignmentOne.title);

    const studentAssignmentsResponse = await student1Client.get('/homework/assignments');
    const studentAssignmentOne = studentAssignmentsResponse.data.find(
      (assignment) => Number(assignment.id) === Number(createdAssignmentOne.id)
    );
    assert(studentAssignmentOne, 'main-flow: created assignment is not visible to student 1');

    const assignmentOneDetails = await getAssignmentDetails(
      student1Client,
      createdAssignmentOne.id,
      'main-flow'
    );
    assert(
      assignmentOneDetails.questions.length === 3,
      'main-flow: assignment should contain exactly 3 questions'
    );

    const submissionOne = await submitAssignmentAnswers(
      student1Client,
      createdAssignmentOne.id,
      assignmentOneDetails.questions.map((question, index) => ({
        question_id: question.id,
        answer_text: [
          'React is a JavaScript library used to build user interfaces.',
          'Components divide the interface into reusable and maintainable parts.',
          'State stores changing data and helps the interface update dynamically.'
        ][index]
      })),
      'main-flow'
    );

    const analyzedSubmissionOne = await waitForAnalysis(
      student1Client,
      submissionOne.id,
      'main-flow'
    );

    assert(
      analyzedSubmissionOne.submission_mode === 'questionnaire',
      'main-flow: submission_mode should be questionnaire'
    );
    assert(analyzedSubmissionOne.feedback, 'main-flow: feedback should be present');
    assert(analyzedSubmissionOne.score !== null, 'main-flow: score should be present');
    assert(
      Number(analyzedSubmissionOne.answered_questions_count) === 3,
      'main-flow: answered_questions_count should be 3'
    );
    assert(
      Number(analyzedSubmissionOne.total_questions_count) === 3,
      'main-flow: total_questions_count should be 3'
    );
    assert(
      !analyzedSubmissionOne.missing_questions,
      'main-flow: missing_questions should be empty for complete answers'
    );

    log(`main-flow: analyzed submission ${submissionOne.id} passed`);

    try {
      await student1Client.post(`/homework/assignments/${createdAssignmentOne.id}/submit`, {
        answers: assignmentOneDetails.questions.map((question) => ({
          question_id: question.id,
          answer_text: 'Duplicate answer test'
        }))
      });
      throw new Error('duplicate-check: duplicate submission was accepted');
    } catch (error) {
      const status = error.response?.status;
      assert(status === 400, 'duplicate-check: expected HTTP 400 on duplicate submission');
      log('duplicate-check: duplicate submission was blocked as expected');
    }

    const teacherHomeworkListResponse = await teacherClient.get('/homework');
    const teacherCanSeeSubmission = teacherHomeworkListResponse.data.some(
      (submission) => Number(submission.id) === Number(submissionOne.id)
    );
    assert(teacherCanSeeSubmission, 'teacher-visibility: teacher cannot see questionnaire submission');

    const dashboardResponse = await teacherClient.get('/homework/dashboard/teacher');
    const dashboardRecentMatch = dashboardResponse.data?.recent_submissions?.some(
      (submission) => Number(submission.id) === Number(submissionOne.id)
    );
    assert(
      Array.isArray(dashboardResponse.data?.recent_submissions),
      'teacher-visibility: dashboard recent_submissions missing'
    );
    log(
      `teacher-visibility: submission ${submissionOne.id} visible in homework list${
        dashboardRecentMatch ? ' and dashboard recent submissions' : ''
      }`
    );

    const createdAssignmentTwo = await createAssignment(
      teacherClient,
      assignmentTwo,
      'incomplete-flow'
    );
    cleanupState.assignmentIds.push(createdAssignmentTwo.id);
    cleanupState.notificationTitles.push(createdAssignmentTwo.title);

    const assignmentTwoDetails = await getAssignmentDetails(
      student2Client,
      createdAssignmentTwo.id,
      'incomplete-flow'
    );

    const submissionTwo = await submitAssignmentAnswers(
      student2Client,
      createdAssignmentTwo.id,
      assignmentTwoDetails.questions.map((question, index) => ({
        question_id: question.id,
        answer_text:
          index === 0
            ? 'React is a JavaScript library for building user interfaces.'
            : ''
      })),
      'incomplete-flow'
    );

    const analyzedSubmissionTwo = await waitForAnalysis(
      student2Client,
      submissionTwo.id,
      'incomplete-flow'
    );

    assert(
      Number(analyzedSubmissionTwo.answered_questions_count) === 1,
      'incomplete-flow: answered_questions_count should be 1'
    );
    assert(
      Number(analyzedSubmissionTwo.total_questions_count) === 3,
      'incomplete-flow: total_questions_count should be 3'
    );
    assert(
      analyzedSubmissionTwo.missing_questions &&
        analyzedSubmissionTwo.missing_questions.includes('Question 2') &&
        analyzedSubmissionTwo.missing_questions.includes('Question 3'),
      'incomplete-flow: missing_questions should list unanswered questions'
    );
    assert(
      analyzedSubmissionTwo.feedback &&
        ['question', 'answer', 'attempt', 'incomplete', 'reponse', 'manquante', 'incomplet'].some((keyword) =>
          analyzedSubmissionTwo.feedback.toLowerCase().includes(keyword)
        ),
      'incomplete-flow: feedback should mention missing answers or incomplete coverage'
    );

    log(`incomplete-flow: analyzed submission ${submissionTwo.id} passed`);

    log('classic-flow: submitting classic text homework');
    const classicSubmissionResponse = await student1Client.post('/homework', classicHomework);
    const classicSubmissionId = classicSubmissionResponse.data?.submission?.id;
    cleanupState.homeworkIds.push(classicSubmissionId);
    cleanupState.notificationTitles.push(classicHomework.title);

    assert(classicSubmissionId, 'classic-flow: classic submission was not created');

    const analyzedClassicSubmission = await waitForAnalysis(
      student1Client,
      classicSubmissionId,
      'classic-flow'
    );

    assert(
      analyzedClassicSubmission.submission_mode === 'classic',
      'classic-flow: submission_mode should remain classic'
    );
    assert(analyzedClassicSubmission.feedback, 'classic-flow: feedback should be present');
    assert(analyzedClassicSubmission.score !== null, 'classic-flow: score should be present');

    log(`classic-flow: analyzed submission ${classicSubmissionId} passed`);

    console.log('');
    console.log('Smoke test summary');
    console.log(
      JSON.stringify(
        {
          main_flow_submission_id: submissionOne.id,
          incomplete_flow_submission_id: submissionTwo.id,
          classic_flow_submission_id: classicSubmissionId,
          created_assignment_ids: [createdAssignmentOne.id, createdAssignmentTwo.id],
          status: 'passed',
          cleanup: KEEP_DATA ? 'kept' : 'automatic'
        },
        null,
        2
      )
    );
  } finally {
    if (cleanupState.teacherClient) {
      await cleanupArtifacts(cleanupState);
    }
  }
};

run().catch((error) => {
  console.error('');
  console.error('Structured assignment smoke test failed');
  console.error(error.response?.data || error.message || error);
  process.exit(1);
});
