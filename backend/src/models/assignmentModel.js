const { pool } = require('../config/db');

const createAssignment = async ({
  teacherId,
  title,
  subject,
  instructions,
  dueDate,
  assignmentType,
  filePath,
  fileName,
  questions
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [assignmentResult] = await connection.query(
      `INSERT INTO homework_assignments (
         teacher_id,
         title,
         subject,
         instructions,
         due_date,
         assignment_type,
         file_path,
         file_name,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        teacherId,
        title,
        subject,
        instructions || null,
        dueDate || null,
        assignmentType || 'questionnaire',
        filePath || null,
        fileName || null
      ]
    );

    for (let index = 0; index < questions.length; index += 1) {
      await connection.query(
        `INSERT INTO homework_assignment_questions (assignment_id, question_text, question_order)
         VALUES (?, ?, ?)`,
        [assignmentResult.insertId, questions[index], index + 1]
      );
    }

    await connection.commit();

    return getAssignmentById(assignmentResult.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAssignmentQuestions = async (assignmentId) => {
  const [rows] = await pool.query(
    `SELECT id, assignment_id, question_text, question_order
     FROM homework_assignment_questions
     WHERE assignment_id = ?
     ORDER BY question_order ASC, id ASC`,
    [assignmentId]
  );

  return rows;
};

const getAssignmentById = async (assignmentId, studentId = null) => {
  const [rows] = await pool.query(
    `SELECT
        ha.id,
        ha.teacher_id,
        ha.title,
        ha.subject,
        ha.instructions,
        ha.due_date,
        ha.assignment_type,
        ha.file_path,
        ha.file_name,
        ha.status,
        ha.created_at,
        u.name AS teacher_name,
        COUNT(DISTINCT hq.id) AS question_count,
        COUNT(DISTINCT hs.id) AS submission_count,
        MAX(CASE WHEN hs.student_id = ? THEN hs.id ELSE NULL END) AS current_submission_id,
        MAX(CASE WHEN hs.student_id = ? THEN hs.status ELSE NULL END) AS current_submission_status
     FROM homework_assignments ha
     JOIN users u ON ha.teacher_id = u.id
     LEFT JOIN homework_assignment_questions hq ON hq.assignment_id = ha.id
     LEFT JOIN homework_submissions hs ON hs.assignment_id = ha.id
     WHERE ha.id = ?
     GROUP BY
        ha.id,
        ha.teacher_id,
        ha.title,
        ha.subject,
        ha.instructions,
        ha.due_date,
        ha.assignment_type,
        ha.file_path,
        ha.file_name,
        ha.status,
        ha.created_at,
        u.name
     LIMIT 1`,
    [studentId || 0, studentId || 0, assignmentId]
  );

  const assignment = rows[0];

  if (!assignment) {
    return null;
  }

  const questions = await getAssignmentQuestions(assignment.id);

  return {
    ...assignment,
    questions
  };
};

const getAssignmentsForTeacher = async (teacherId) => {
  const [rows] = await pool.query(
    `SELECT
        ha.id,
        ha.title,
        ha.subject,
        ha.instructions,
        ha.status,
        ha.due_date,
        ha.assignment_type,
        ha.file_path,
        ha.file_name,
        ha.created_at,
        COUNT(DISTINCT hq.id) AS question_count,
        COUNT(DISTINCT hs.id) AS submission_count
     FROM homework_assignments ha
     LEFT JOIN homework_assignment_questions hq ON hq.assignment_id = ha.id
     LEFT JOIN homework_submissions hs ON hs.assignment_id = ha.id
     WHERE ha.teacher_id = ?
     GROUP BY
        ha.id,
        ha.title,
        ha.subject,
        ha.instructions,
        ha.status,
        ha.due_date,
        ha.assignment_type,
        ha.file_path,
        ha.file_name,
        ha.created_at
     ORDER BY ha.created_at DESC`,
    [teacherId]
  );

  return rows;
};

const getAssignmentsForStudent = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT
        ha.id,
        ha.title,
        ha.subject,
        ha.instructions,
        ha.status,
        ha.due_date,
        ha.assignment_type,
        ha.file_path,
        ha.file_name,
        ha.created_at,
        u.name AS teacher_name,
        COUNT(DISTINCT hq.id) AS question_count,
        MAX(CASE WHEN hs.student_id = ? THEN hs.id ELSE NULL END) AS submission_id,
        MAX(CASE WHEN hs.student_id = ? THEN hs.status ELSE NULL END) AS submission_status,
        MAX(CASE WHEN hs.student_id = ? THEN COALESCE(an.final_note, an.score) ELSE NULL END) AS score
     FROM homework_assignments ha
     JOIN users u ON ha.teacher_id = u.id
     LEFT JOIN homework_assignment_questions hq ON hq.assignment_id = ha.id
     LEFT JOIN homework_submissions hs ON hs.assignment_id = ha.id
     LEFT JOIN homework_analysis an ON an.submission_id = hs.id
     WHERE ha.status = 'active'
     GROUP BY
        ha.id,
        ha.title,
        ha.subject,
        ha.instructions,
        ha.status,
        ha.due_date,
        ha.assignment_type,
        ha.file_path,
        ha.file_name,
        ha.created_at,
        u.name
     ORDER BY
        CASE WHEN ha.due_date IS NULL THEN 1 ELSE 0 END,
        ha.due_date ASC,
        ha.created_at DESC`,
    [studentId, studentId, studentId]
  );

  return rows;
};

const countAssignmentsForTeacher = async (teacherId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total_assignments
     FROM homework_assignments
     WHERE teacher_id = ?`,
    [teacherId]
  );

  return rows[0];
};

const countOpenAssignmentsForStudent = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT
        COUNT(*) AS available_assignments,
        SUM(CASE WHEN submitted.submission_id IS NOT NULL THEN 1 ELSE 0 END) AS answered_assignments
     FROM homework_assignments ha
     LEFT JOIN (
        SELECT assignment_id, MAX(id) AS submission_id
        FROM homework_submissions
        WHERE student_id = ? AND assignment_id IS NOT NULL
        GROUP BY assignment_id
     ) submitted ON submitted.assignment_id = ha.id
     WHERE ha.status = 'active'`,
    [studentId]
  );

  return rows[0];
};

const getExistingAssignmentSubmission = async (assignmentId, studentId) => {
  const [rows] = await pool.query(
    `SELECT id, status
     FROM homework_submissions
     WHERE assignment_id = ? AND student_id = ?
     LIMIT 1`,
    [assignmentId, studentId]
  );

  return rows[0];
};

const createQuestionnaireSubmission = async ({
  assignmentId,
  studentId,
  title,
  subject,
  compiledContent,
  answers
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [submissionResult] = await connection.query(
      `INSERT INTO homework_submissions (
         student_id,
         assignment_id,
         title,
         subject,
         submission_mode,
         content,
         status
       )
       VALUES (?, ?, ?, ?, 'questionnaire', ?, 'submitted')`,
      [studentId, assignmentId, title, subject, compiledContent]
    );

    for (const answer of answers) {
      await connection.query(
        `INSERT INTO homework_submission_answers (submission_id, question_id, answer_text)
         VALUES (?, ?, ?)`,
        [submissionResult.insertId, answer.question_id, answer.answer_text]
      );
    }

    await connection.commit();

    return submissionResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const createFileSubmission = async ({
  assignmentId,
  studentId,
  title,
  subject,
  content,
  filePath
}) => {
  const [submissionResult] = await pool.query(
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
     VALUES (?, ?, ?, ?, 'classic', ?, ?, 'submitted')`,
    [studentId, assignmentId, title, subject, content || null, filePath || null]
  );

  return submissionResult.insertId;
};

const updateAssignmentStatus = async (assignmentId, status) => {
  await pool.query(
    `UPDATE homework_assignments
     SET status = ?
     WHERE id = ?`,
    [status, assignmentId]
  );
};

const deleteAssignment = async (assignmentId) => {
  await pool.query('DELETE FROM homework_assignments WHERE id = ?', [assignmentId]);
};

module.exports = {
  createAssignment,
  getAssignmentById,
  getAssignmentsForTeacher,
  getAssignmentsForStudent,
  countAssignmentsForTeacher,
  countOpenAssignmentsForStudent,
  getExistingAssignmentSubmission,
  createQuestionnaireSubmission,
  createFileSubmission,
  updateAssignmentStatus,
  deleteAssignment
};
