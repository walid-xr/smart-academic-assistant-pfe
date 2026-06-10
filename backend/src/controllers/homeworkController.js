const fs = require('fs');
const path = require('path');
const assignmentModel = require('../models/assignmentModel');
const analysisModel = require('../models/analysisModel');
const homeworkModel = require('../models/homeworkModel');
const notificationModel = require('../models/notificationModel');
const studentModel = require('../models/studentModel');
const userModel = require('../models/userModel');
const { getHighestSimilarity } = require('../utils/similarity');
const { sendSubmissionForAnalysis } = require('../services/n8nService');

const feedbackLanguageInstructions =
  'Return all student-facing evaluation text in French. The feedback, key strengths, improvement tips, and missing question notes must be simple, clear, and useful for a student.';

const buildQuestionnaireContent = (questions, answers) =>
  questions
    .map((question, index) => {
      const matchingAnswer = answers.find((answer) => Number(answer.question_id) === Number(question.id));
      return `Question ${index + 1}: ${question.question_text}\nReponse: ${matchingAnswer?.answer_text || ''}`;
    })
    .join('\n\n');

const getUploadedFilePath = (file) => {
  if (!file) {
    return null;
  }

  const folderName = file.fieldname === 'assignment_file' ? 'assignments' : 'homework';
  return `/uploads/${folderName}/${file.filename}`;
};

const buildAssignmentPayload = (assignment) => {
  if (!assignment) {
    return null;
  }

  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

  return {
    id: assignment.id,
    type: assignment.assignment_type || 'questionnaire',
    instructions: assignment.instructions || '',
    dueDate: assignment.due_date,
    fileName: assignment.file_name,
    filePath: assignment.file_path,
    fileUrl: assignment.file_path ? `${serverUrl}${assignment.file_path}` : null
  };
};

const buildWebhookPayload = ({
  submission,
  student,
  similarityResult,
  questionnaire = null,
  assignment = null
}) => {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const assignmentPayload = buildAssignmentPayload(assignment);

  return {
    submissionId: submission.id,
    title: submission.title,
    subject: submission.subject,
    submissionType: submission.submission_mode || 'classic',
    content: submission.content,
    filePath: submission.file_path,
    fileUrl: submission.file_path ? `${serverUrl}${submission.file_path}` : null,
    submissionDate: submission.submission_date,
    plagiarismPercentage: similarityResult.percentage,
    evaluationLanguage: 'fr',
    feedbackLanguage: 'fr',
    feedbackInstructions: feedbackLanguageInstructions,
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      className: student.class_name
    },
    ...(assignmentPayload ? { assignment: assignmentPayload } : {}),
    ...(questionnaire ? { questionnaire } : {})
  };
};

const normalizeDueDate = (value) => {
  if (!value) {
    return null;
  }

  return String(value).slice(0, 10);
};

const parseQuestions = (questions) => {
  if (Array.isArray(questions)) {
    return questions.map((question) => String(question || '').trim()).filter(Boolean);
  }

  if (typeof questions === 'string') {
    try {
      const parsedQuestions = JSON.parse(questions);

      if (Array.isArray(parsedQuestions)) {
        return parsedQuestions.map((question) => String(question || '').trim()).filter(Boolean);
      }
    } catch (error) {
      return questions
        .split('\n')
        .map((question) => question.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const notifyTeachers = async ({ type, message }) => {
  const teachers = await userModel.findTeachers();

  await Promise.all(
    teachers.map((teacher) =>
      notificationModel.createNotification({
        userId: teacher.id,
        type,
        message
      })
    )
  );
};

const submitHomework = async (req, res, next) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !subject) {
      res.status(400);
      throw new Error('Le titre et la matiere sont obligatoires.');
    }

    if (!content && !req.file) {
      res.status(400);
      throw new Error('Veuillez fournir une reponse texte ou un fichier PDF.');
    }

    const student = await studentModel.findByUserId(req.user.id);

    if (!student) {
      res.status(404);
      throw new Error('Profil etudiant introuvable.');
    }

    const filePath = getUploadedFilePath(req.file);

    const submission = await homeworkModel.createSubmission({
      studentId: student.id,
      assignmentId: null,
      title,
      subject,
      submissionMode: 'classic',
      content,
      filePath
    });

    const similarTexts = content ? await homeworkModel.getSimilarTexts(subject, submission.id) : [];
    const similarityResult = content
      ? getHighestSimilarity(content, similarTexts)
      : { percentage: 0, matchedSubmissionId: null };

    await analysisModel.createPlaceholder(submission.id, similarityResult.percentage);

    await notificationModel.createNotification({
      userId: req.user.id,
      type: 'submission',
      message: `Votre devoir "${title}" a ete soumis avec succes.`
    });

    await notifyTeachers({
      type: 'submission',
      message: `${student.name} a soumis "${title}" en ${subject}.`
    });

    const n8nResponse = await sendSubmissionForAnalysis(
      buildWebhookPayload({
        submission,
        student,
        similarityResult
      })
    );

    if (n8nResponse.success) {
      await homeworkModel.updateSubmissionStatus(submission.id, 'processing');
    }

    const createdSubmission = await homeworkModel.getSubmissionById(submission.id);

    res.status(201).json({
      message: 'Devoir soumis avec succes.',
      submission: createdSubmission,
      webhook_status: n8nResponse.success ? 'sent_to_n8n' : 'stored_locally',
      similarity: similarityResult
    });
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const { title, subject, instructions, due_date, questions } = req.body;
    const assignmentType = req.body.assignment_type === 'pdf' ? 'pdf' : 'questionnaire';
    const cleanQuestions = parseQuestions(questions);

    if (!title || !subject) {
      res.status(400);
      throw new Error('Le titre et la matiere sont obligatoires.');
    }

    if (assignmentType === 'questionnaire' && cleanQuestions.length === 0) {
      res.status(400);
      throw new Error('Veuillez ajouter au moins une question.');
    }

    if (assignmentType === 'pdf' && !req.file) {
      res.status(400);
      throw new Error('Veuillez importer le PDF du devoir.');
    }

    const assignment = await assignmentModel.createAssignment({
      teacherId: req.user.id,
      title,
      subject,
      instructions,
      dueDate: normalizeDueDate(due_date),
      assignmentType,
      filePath: getUploadedFilePath(req.file),
      fileName: req.file?.originalname || null,
      questions: assignmentType === 'questionnaire' ? cleanQuestions : []
    });

    await notificationModel.createNotification({
      userId: req.user.id,
      type: 'assignment',
      message: `Le devoir "${title}" a ete cree avec succes.`
    });

    res.status(201).json({
      message: 'Devoir cree avec succes.',
      assignment
    });
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      const assignments = await assignmentModel.getAssignmentsForTeacher(req.user.id);
      return res.json(assignments);
    }

    const student = await studentModel.findByUserId(req.user.id);

    if (!student) {
      res.status(404);
      throw new Error('Profil etudiant introuvable.');
    }

    const assignments = await assignmentModel.getAssignmentsForStudent(student.id);
    return res.json(assignments);
  } catch (error) {
    next(error);
  }
};

const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'closed'].includes(status)) {
      res.status(400);
      throw new Error('Le statut doit etre actif ou ferme.');
    }

    const assignment = await assignmentModel.getAssignmentById(req.params.id);

    if (!assignment) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    if (Number(assignment.teacher_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Vous pouvez modifier uniquement vos propres devoirs.' });
    }

    await assignmentModel.updateAssignmentStatus(assignment.id, status);

    const updatedAssignment = await assignmentModel.getAssignmentById(assignment.id);

    res.json({
      message: status === 'closed' ? 'Devoir marque comme ferme.' : 'Devoir marque comme actif.',
      assignment: updatedAssignment
    });
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentModel.getAssignmentById(req.params.id);

    if (!assignment) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    if (Number(assignment.teacher_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Vous pouvez supprimer uniquement vos propres devoirs.' });
    }

    await assignmentModel.deleteAssignment(assignment.id);

    res.json({
      message: 'Devoir supprime avec succes.'
    });
  } catch (error) {
    next(error);
  }
};

const getAssignmentDetails = async (req, res, next) => {
  try {
    let studentId = null;

    if (req.user.role === 'student') {
      const student = await studentModel.findByUserId(req.user.id);

      if (!student) {
        res.status(404);
        throw new Error('Profil etudiant introuvable.');
      }

      studentId = student.id;
    }

    const assignment = await assignmentModel.getAssignmentById(req.params.id, studentId);

    if (!assignment) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    if (req.user.role === 'teacher' && Number(assignment.teacher_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Vous pouvez consulter uniquement vos propres devoirs.' });
    }

    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

const submitAssignmentAnswers = async (req, res, next) => {
  try {
    const student = await studentModel.findByUserId(req.user.id);

    if (!student) {
      res.status(404);
      throw new Error('Profil etudiant introuvable.');
    }

    const assignment = await assignmentModel.getAssignmentById(req.params.id, student.id);

    if (!assignment) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    if (assignment.status !== 'active') {
      res.status(400);
      throw new Error('Ce devoir est ferme aux soumissions.');
    }

    const existingSubmission = await assignmentModel.getExistingAssignmentSubmission(
      assignment.id,
      student.id
    );

    if (existingSubmission) {
      res.status(400);
      throw new Error('Vous avez deja soumis une reponse pour ce devoir.');
    }

    if (assignment.assignment_type === 'pdf') {
      const content = String(req.body.content || '').trim();
      const filePath = getUploadedFilePath(req.file);

      if (!content && !filePath) {
        res.status(400);
        throw new Error('Veuillez fournir une reponse texte ou importer votre reponse PDF.');
      }

      const submissionId = await assignmentModel.createFileSubmission({
        assignmentId: assignment.id,
        studentId: student.id,
        title: assignment.title,
        subject: assignment.subject,
        content,
        filePath
      });

      const submission = await homeworkModel.getSubmissionById(submissionId);
      const similarTexts = content ? await homeworkModel.getSimilarTexts(assignment.subject, submission.id) : [];
      const similarityResult = content
        ? getHighestSimilarity(content, similarTexts)
        : { percentage: 0, matchedSubmissionId: null };

      await analysisModel.createPlaceholder(submission.id, similarityResult.percentage);

      await notificationModel.createNotification({
        userId: req.user.id,
        type: 'submission',
        message: `Votre soumission pour "${assignment.title}" a ete envoyee avec succes.`
      });

      await notificationModel.createNotification({
        userId: assignment.teacher_id,
        type: 'submission',
        message: `${student.name} a soumis "${assignment.title}".`
      });

      const n8nResponse = await sendSubmissionForAnalysis(
        buildWebhookPayload({
          submission,
          student,
          similarityResult,
          assignment
        })
      );

      if (n8nResponse.success) {
        await homeworkModel.updateSubmissionStatus(submission.id, 'processing');
      }

      const createdSubmission = await homeworkModel.getSubmissionById(submission.id);

      return res.status(201).json({
        message: 'Soumission du devoir envoyee avec succes.',
        submission: createdSubmission,
        webhook_status: n8nResponse.success ? 'sent_to_n8n' : 'stored_locally',
        similarity: similarityResult
      });
    }

    const rawAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const answersByQuestionId = new Map(
      rawAnswers.map((answer) => [Number(answer.question_id), String(answer.answer_text || '').trim()])
    );

    const preparedAnswers = assignment.questions.map((question) => ({
      question_id: question.id,
      question_text: question.question_text,
      question_order: question.question_order,
      answer_text: answersByQuestionId.get(Number(question.id)) || ''
    }));

    if (preparedAnswers.every((answer) => !answer.answer_text)) {
      res.status(400);
      throw new Error('Veuillez repondre a au moins une question avant de soumettre.');
    }

    const compiledContent = buildQuestionnaireContent(assignment.questions, preparedAnswers);

    const submissionId = await assignmentModel.createQuestionnaireSubmission({
      assignmentId: assignment.id,
      studentId: student.id,
      title: assignment.title,
      subject: assignment.subject,
      compiledContent,
      answers: preparedAnswers
    });

    const submission = await homeworkModel.getSubmissionById(submissionId);
    const similarTexts = await homeworkModel.getSimilarTexts(assignment.subject, submission.id);
    const similarityResult = getHighestSimilarity(compiledContent, similarTexts);

    await analysisModel.createPlaceholder(submission.id, similarityResult.percentage);

    await notificationModel.createNotification({
      userId: req.user.id,
      type: 'submission',
      message: `Vos reponses pour "${assignment.title}" ont ete soumises avec succes.`
    });

    await notificationModel.createNotification({
      userId: assignment.teacher_id,
      type: 'submission',
      message: `${student.name} a repondu a "${assignment.title}".`
    });

    const n8nResponse = await sendSubmissionForAnalysis(
      buildWebhookPayload({
        submission,
        student,
        similarityResult,
        assignment,
        questionnaire: {
          assignmentId: assignment.id,
          instructions: assignment.instructions || '',
          questions: preparedAnswers.map((answer) => ({
            questionId: answer.question_id,
            order: answer.question_order,
            questionText: answer.question_text,
            answerText: answer.answer_text
          }))
        }
      })
    );

    if (n8nResponse.success) {
      await homeworkModel.updateSubmissionStatus(submission.id, 'processing');
    }

    const createdSubmission = await homeworkModel.getSubmissionById(submission.id);

    res.status(201).json({
      message: 'Reponses du devoir soumises avec succes.',
      submission: createdSubmission,
      webhook_status: n8nResponse.success ? 'sent_to_n8n' : 'stored_locally',
      similarity: similarityResult
    });
  } catch (error) {
    next(error);
  }
};

const getHomeworkList = async (req, res, next) => {
  try {
    const { search = '', status = '' } = req.query;

    let studentId = null;

    if (req.user.role === 'student') {
      const student = await studentModel.findByUserId(req.user.id);

      if (!student) {
        res.status(404);
        throw new Error('Profil etudiant introuvable.');
      }

      studentId = student.id;
    }

    const submissions = await homeworkModel.getHomeworkList({
      role: req.user.role,
      studentId,
      search,
      status
    });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

const getHomeworkDetails = async (req, res, next) => {
  try {
    const submission = await homeworkModel.getSubmissionById(req.params.id);

    if (!submission) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    if (req.user.role === 'student' && submission.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous pouvez consulter uniquement vos propres devoirs.' });
    }

    res.json(submission);
  } catch (error) {
    next(error);
  }
};

const getTeacherDashboard = async (req, res, next) => {
  try {
    const [overview, recentSubmissions, topStudents, reviewStatus, assignmentStats] = await Promise.all([
      homeworkModel.getTeacherOverview(),
      homeworkModel.getRecentSubmissions(),
      homeworkModel.getTopStudents(),
      homeworkModel.getReviewStatusBreakdown(),
      assignmentModel.countAssignmentsForTeacher(req.user.id)
    ]);

    res.json({
      overview: {
        total_submissions: Number(overview.total_submissions || 0),
        total_students: Number(overview.total_students || 0),
        average_score: Number(overview.average_score || 0),
        flagged_count: Number(overview.flagged_count || 0),
        structured_assignments: Number(assignmentStats.total_assignments || 0)
      },
      recent_submissions: recentSubmissions,
      top_students: topStudents,
      review_status: reviewStatus
    });
  } catch (error) {
    next(error);
  }
};

const markHomeworkAsReviewed = async (req, res, next) => {
  try {
    const { final_note } = req.body;
    const submission = await homeworkModel.getSubmissionById(req.params.id);

    if (!submission) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    await analysisModel.updateFinalNote(submission.id, final_note || submission.score || null);
    await homeworkModel.updateSubmissionStatus(submission.id, 'reviewed');

    await notificationModel.createNotification({
      userId: submission.student_user_id,
      type: 'review',
      message: `Votre devoir "${submission.title}" a ete corrige par le professeur.`
    });

    const updatedSubmission = await homeworkModel.getSubmissionById(submission.id);
    res.json({
      message: 'Devoir marque comme corrige.',
      submission: updatedSubmission
    });
  } catch (error) {
    next(error);
  }
};

const deleteHomework = async (req, res, next) => {
  try {
    const submission = await homeworkModel.getSubmissionById(req.params.id);

    if (!submission) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    if (submission.file_path) {
      const fileSystemPath = path.join(__dirname, '../../../', submission.file_path);

      if (fs.existsSync(fileSystemPath)) {
        fs.unlinkSync(fileSystemPath);
      }
    }

    await homeworkModel.deleteSubmission(submission.id);

    res.json({
      message: 'Devoir supprime avec succes.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitHomework,
  createAssignment,
  getAssignments,
  updateAssignmentStatus,
  deleteAssignment,
  getAssignmentDetails,
  submitAssignmentAnswers,
  getHomeworkList,
  getHomeworkDetails,
  getTeacherDashboard,
  markHomeworkAsReviewed,
  deleteHomework
};
