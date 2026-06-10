const { pool } = require('../config/db');

const createStudent = async ({ userId, className }) => {
  const [result] = await pool.query(
    'INSERT INTO students (user_id, class_name) VALUES (?, ?)',
    [userId, className]
  );

  return {
    id: result.insertId,
    user_id: userId,
    class_name: className
  };
};

const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.user_id, s.class_name, s.created_at, u.name, u.email
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0];
};

const countStudents = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) AS total_students FROM students');
  return rows[0];
};

const getStudentStats = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT
        COUNT(hs.id) AS total_submissions,
        SUM(CASE WHEN hs.status = 'reviewed' THEN 1 ELSE 0 END) AS reviewed_count,
        ROUND(IFNULL(AVG(COALESCE(ha.final_note, ha.score)), 0), 2) AS average_score,
        SUM(CASE WHEN ha.cheating_flag = 1 THEN 1 ELSE 0 END) AS flagged_count
     FROM homework_submissions hs
     LEFT JOIN homework_analysis ha ON ha.submission_id = hs.id
     WHERE hs.student_id = ?`,
    [studentId]
  );

  return rows[0];
};

const getRecentSubmissions = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT
        hs.id,
        hs.title,
        hs.subject,
        hs.submission_date,
        hs.status,
        ha.score,
        ha.final_note,
        ha.cheating_flag
     FROM homework_submissions hs
     LEFT JOIN homework_analysis ha ON ha.submission_id = hs.id
     WHERE hs.student_id = ?
     ORDER BY hs.submission_date DESC
     LIMIT 5`,
    [studentId]
  );

  return rows;
};

module.exports = {
  createStudent,
  findByUserId,
  countStudents,
  getStudentStats,
  getRecentSubmissions
};

