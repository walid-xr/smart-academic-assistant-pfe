const { pool } = require('../config/db');

const createSubmission = async ({
  studentId,
  assignmentId = null,
  title,
  subject,
  submissionMode = 'classic',
  content,
  filePath
}) => {
  const [result] = await pool.query(
    `INSERT INTO homework_submissions (
       student_id,
       assignment_id,
       title,
       subject,
       submission_mode,
       content,
       file_path,
       status
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')`,
    [studentId, assignmentId, title, subject, submissionMode, content || null, filePath || null]
  );

  return getSubmissionById(result.insertId);
};

const getSimilarTexts = async (subject, excludeSubmissionId) => {
  const [rows] = await pool.query(
    `SELECT id, content
     FROM homework_submissions
     WHERE subject = ? AND content IS NOT NULL AND id <> ?`,
    [subject, excludeSubmissionId]
  );

  return rows;
};

const updateSubmissionStatus = async (submissionId, status) => {
  await pool.query('UPDATE homework_submissions SET status = ? WHERE id = ?', [status, submissionId]);
};

const getSubmissionById = async (submissionId) => {
  const [rows] = await pool.query(
    `SELECT
        hs.id,
        hs.student_id,
        hs.assignment_id,
        hs.title,
        hs.subject,
        hs.submission_mode,
        hs.content,
        hs.file_path,
        hs.submission_date,
        hs.status,
        s.class_name,
        u.id AS student_user_id,
        u.name AS student_name,
        u.email AS student_email,
        ha.id AS analysis_id,
        ha.score,
        ha.feedback,
        ha.grammar_score,
        ha.structure_score,
        ha.content_score,
        ha.answered_questions_count,
        ha.total_questions_count,
        ha.missing_questions,
        ha.ai_probability,
        ha.plagiarism_percentage,
        ha.cheating_flag,
        ha.reviewed_by_teacher,
        ha.final_note,
        assignm.instructions AS assignment_instructions,
        assignm.due_date AS assignment_due_date,
        assignm.assignment_type,
        assignm.file_path AS assignment_file_path,
        assignm.file_name AS assignment_file_name
     FROM homework_submissions hs
     JOIN students s ON hs.student_id = s.id
     JOIN users u ON s.user_id = u.id
     LEFT JOIN homework_analysis ha ON ha.submission_id = hs.id
     LEFT JOIN homework_assignments assignm ON assignm.id = hs.assignment_id
     WHERE hs.id = ?
     LIMIT 1`,
    [submissionId]
  );

  const submission = rows[0];

  if (!submission) {
    return null;
  }

  if (submission.submission_mode === 'questionnaire') {
    const [answerRows] = await pool.query(
      `SELECT
          hsa.question_id,
          hsa.answer_text,
          haq.question_text,
          haq.question_order
       FROM homework_submission_answers hsa
       JOIN homework_assignment_questions haq ON hsa.question_id = haq.id
       WHERE hsa.submission_id = ?
       ORDER BY haq.question_order ASC, hsa.id ASC`,
      [submissionId]
    );

    submission.structured_answers = answerRows;
  }

  return submission;
};

const getHomeworkList = async ({ role, studentId, search, status }) => {
  let query = `
    SELECT
      hs.id,
      hs.title,
      hs.subject,
      hs.assignment_id,
      hs.submission_mode,
      assignm.assignment_type,
      hs.submission_date,
      hs.status,
      u.name AS student_name,
      ha.score,
      ha.final_note,
      ha.cheating_flag,
      ha.ai_probability,
      ha.plagiarism_percentage
    FROM homework_submissions hs
    JOIN students s ON hs.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN homework_analysis ha ON ha.submission_id = hs.id
    LEFT JOIN homework_assignments assignm ON assignm.id = hs.assignment_id
    WHERE 1 = 1
  `;

  const params = [];

  if (role === 'student') {
    query += ' AND hs.student_id = ?';
    params.push(studentId);
  }

  if (search) {
    query += ' AND (hs.title LIKE ? OR hs.subject LIKE ? OR u.name LIKE ?)';
    const likeSearch = `%${search}%`;
    params.push(likeSearch, likeSearch, likeSearch);
  }

  if (status) {
    query += ' AND hs.status = ?';
    params.push(status);
  }

  query += ' ORDER BY hs.submission_date DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

const deleteSubmission = async (submissionId) => {
  await pool.query('DELETE FROM homework_submissions WHERE id = ?', [submissionId]);
};

const getTeacherOverview = async () => {
  const [rows] = await pool.query(
    `SELECT
        (SELECT COUNT(*) FROM homework_submissions) AS total_submissions,
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT ROUND(IFNULL(AVG(score), 0), 2) FROM homework_analysis) AS average_score,
        (SELECT COUNT(*) FROM homework_analysis WHERE cheating_flag = 1) AS flagged_count`
  );

  return rows[0];
};

const getRecentSubmissions = async () => {
  const [rows] = await pool.query(
    `SELECT
        hs.id,
        hs.title,
        hs.subject,
        hs.submission_mode,
        assignm.assignment_type,
        hs.submission_date,
        hs.status,
        u.name AS student_name,
        ha.score,
        ha.cheating_flag
     FROM homework_submissions hs
     JOIN students s ON hs.student_id = s.id
     JOIN users u ON s.user_id = u.id
     LEFT JOIN homework_analysis ha ON ha.submission_id = hs.id
     LEFT JOIN homework_assignments assignm ON assignm.id = hs.assignment_id
     ORDER BY hs.submission_date DESC
     LIMIT 6`
  );

  return rows;
};

const getTopStudents = async () => {
  const [rows] = await pool.query(
    `SELECT
        u.name AS student_name,
        s.class_name,
        ROUND(AVG(COALESCE(ha.final_note, ha.score)), 2) AS average_score,
        COUNT(hs.id) AS total_submissions
     FROM homework_submissions hs
     JOIN students s ON hs.student_id = s.id
     JOIN users u ON s.user_id = u.id
     JOIN homework_analysis ha ON ha.submission_id = hs.id
     WHERE ha.score IS NOT NULL
     GROUP BY u.name, s.class_name
     ORDER BY average_score DESC, total_submissions DESC
     LIMIT 5`
  );

  return rows;
};

const getReviewStatusBreakdown = async () => {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS total
     FROM homework_submissions
     GROUP BY status`
  );

  return rows;
};

module.exports = {
  createSubmission,
  getSimilarTexts,
  updateSubmissionStatus,
  getSubmissionById,
  getHomeworkList,
  deleteSubmission,
  getTeacherOverview,
  getRecentSubmissions,
  getTopStudents,
  getReviewStatusBreakdown
};
