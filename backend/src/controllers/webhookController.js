const analysisModel = require('../models/analysisModel');
const homeworkModel = require('../models/homeworkModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');
const { sendResultEmail, sendCheatingAlert } = require('../services/n8nService');

const receiveAnalysisResult = async (req, res, next) => {
  try {
    const {
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
      plagiarism_percentage
    } = req.body;

    if (!submission_id) {
      res.status(400);
      throw new Error('submission_id est obligatoire.');
    }

    const submission = await homeworkModel.getSubmissionById(submission_id);

    if (!submission) {
      res.status(404);
      throw new Error('Soumission introuvable.');
    }

    const existingAnalysis = await analysisModel.getBySubmissionId(submission_id);
    const finalPlagiarism = Number(
      plagiarism_percentage ?? existingAnalysis?.plagiarism_percentage ?? 0
    );
    const finalAiProbability = Number(ai_probability ?? 0);
    const cheatingFlag = finalAiProbability >= 70 || finalPlagiarism >= 60 ? 1 : 0;

    await analysisModel.saveAnalysis({
      submissionId: submission_id,
      score: score !== undefined ? Number(score) : null,
      feedback: feedback || null,
      grammarScore: grammar_score !== undefined ? Number(grammar_score) : null,
      structureScore: structure_score !== undefined ? Number(structure_score) : null,
      contentScore: content_score !== undefined ? Number(content_score) : null,
      answeredQuestionsCount:
        answered_questions_count !== undefined ? Number(answered_questions_count) : 0,
      totalQuestionsCount:
        total_questions_count !== undefined ? Number(total_questions_count) : 0,
      missingQuestions: Array.isArray(missing_questions)
        ? missing_questions.join('\n')
        : missing_questions || null,
      aiProbability: finalAiProbability,
      plagiarismPercentage: finalPlagiarism,
      cheatingFlag
    });

    await homeworkModel.updateSubmissionStatus(submission_id, 'analyzed');

    await notificationModel.createNotification({
      userId: submission.student_user_id,
      type: 'analysis',
      message: `Analyse terminee pour "${submission.title}".`
    });

    await sendResultEmail({
      submissionId: submission.id,
      title: submission.title,
      subject: submission.subject,
      studentName: submission.student_name,
      studentEmail: submission.student_email,
      score,
      feedback,
      cheatingFlag
    });

    if (cheatingFlag) {
      const teachers = await userModel.findTeachers();

      await Promise.all(
        teachers.map((teacher) =>
          notificationModel.createNotification({
            userId: teacher.id,
            type: 'alert',
            message: `Risque de triche detecte pour "${submission.title}" soumis par ${submission.student_name}.`
          })
        )
      );

      await sendCheatingAlert({
        submissionId: submission.id,
        title: submission.title,
        subject: submission.subject,
        studentName: submission.student_name,
        studentEmail: submission.student_email,
        aiProbability: finalAiProbability,
        plagiarismPercentage: finalPlagiarism,
        teacherEmails: teachers.map((teacher) => teacher.email)
      });
    }

    res.json({
      message: "Resultat de l'analyse enregistre avec succes.",
      cheating_flag: Boolean(cheatingFlag)
    });
  } catch (error) {
    next(error);
  }
};

const getWeeklyReportData = async (req, res, next) => {
  try {
    const summary = await analysisModel.getWeeklySummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  receiveAnalysisResult,
  getWeeklyReportData
};
