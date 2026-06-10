const { pool } = require('../config/db');

const createPlaceholder = async (submissionId, plagiarismPercentage) => {
  const cheatingFlag = plagiarismPercentage >= 60 ? 1 : 0;

  await pool.query(
    `INSERT INTO homework_analysis (submission_id, plagiarism_percentage, cheating_flag)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       plagiarism_percentage = VALUES(plagiarism_percentage),
       cheating_flag = VALUES(cheating_flag)`,
    [submissionId, plagiarismPercentage, cheatingFlag]
  );
};

const getBySubmissionId = async (submissionId) => {
  const [rows] = await pool.query(
    'SELECT * FROM homework_analysis WHERE submission_id = ? LIMIT 1',
    [submissionId]
  );

  return rows[0];
};

const saveAnalysis = async ({
  submissionId,
  score,
  feedback,
  grammarScore,
  structureScore,
  contentScore,
  answeredQuestionsCount,
  totalQuestionsCount,
  missingQuestions,
  aiProbability,
  plagiarismPercentage,
  cheatingFlag
}) => {
  await pool.query(
    `INSERT INTO homework_analysis (
       submission_id,
       score,
       feedback,
       grammar_score,
       structure_score,
       content_score,
       answered_questions_count,
       total_questions_count,
       missing_questions,
       ai_probability,
       plagiarism_percentage,
       cheating_flag
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       score = VALUES(score),
       feedback = VALUES(feedback),
       grammar_score = VALUES(grammar_score),
       structure_score = VALUES(structure_score),
       content_score = VALUES(content_score),
       answered_questions_count = VALUES(answered_questions_count),
       total_questions_count = VALUES(total_questions_count),
       missing_questions = VALUES(missing_questions),
       ai_probability = VALUES(ai_probability),
       plagiarism_percentage = VALUES(plagiarism_percentage),
       cheating_flag = VALUES(cheating_flag)`,
    [
      submissionId,
      score,
      feedback,
      grammarScore,
      structureScore,
      contentScore,
      answeredQuestionsCount || 0,
      totalQuestionsCount || 0,
      missingQuestions || null,
      aiProbability,
      plagiarismPercentage,
      cheatingFlag
    ]
  );
};

const updateFinalNote = async (submissionId, finalNote) => {
  await pool.query(
    `UPDATE homework_analysis
     SET final_note = ?, reviewed_by_teacher = 1
     WHERE submission_id = ?`,
    [finalNote, submissionId]
  );
};

const getWeeklySummary = async () => {
  const [overviewRows] = await pool.query(
    `SELECT
        COUNT(hs.id) AS total_submissions,
        ROUND(IFNULL(AVG(ha.score), 0), 2) AS average_score,
        SUM(CASE WHEN ha.cheating_flag = 1 THEN 1 ELSE 0 END) AS flagged_homework
     FROM homework_submissions hs
     LEFT JOIN homework_analysis ha ON ha.submission_id = hs.id
     WHERE hs.submission_date >= NOW() - INTERVAL 7 DAY`
  );

  const [flaggedRows] = await pool.query(
    `SELECT
        hs.id AS submission_id,
        hs.title,
        hs.subject,
        u.name AS student_name,
        ha.score,
        ha.ai_probability,
        ha.plagiarism_percentage
     FROM homework_submissions hs
     JOIN students s ON hs.student_id = s.id
     JOIN users u ON s.user_id = u.id
     JOIN homework_analysis ha ON ha.submission_id = hs.id
     WHERE hs.submission_date >= NOW() - INTERVAL 7 DAY
       AND ha.cheating_flag = 1
     ORDER BY hs.submission_date DESC
     LIMIT 10`
  );

  return {
    generated_at: new Date().toISOString(),
    period: 'Last 7 days',
    overview: overviewRows[0],
    flagged_submissions: flaggedRows
  };
};

module.exports = {
  createPlaceholder,
  getBySubmissionId,
  saveAnalysis,
  updateFinalNote,
  getWeeklySummary
};
