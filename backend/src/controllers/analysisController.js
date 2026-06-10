const analysisModel = require('../models/analysisModel');
const homeworkModel = require('../models/homeworkModel');

const getAnalysisBySubmission = async (req, res, next) => {
  try {
    const submission = await homeworkModel.getSubmissionById(req.params.submissionId);

    if (!submission) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    if (req.user.role === 'student' && submission.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous pouvez consulter uniquement votre propre analyse.' });
    }

    const analysis = await analysisModel.getBySubmissionId(req.params.submissionId);
    res.json(analysis || {});
  } catch (error) {
    next(error);
  }
};

const updateFinalNote = async (req, res, next) => {
  try {
    const { final_note } = req.body;

    if (final_note === undefined || final_note === null || final_note === '') {
      res.status(400);
      throw new Error('La note finale est obligatoire.');
    }

    const submission = await homeworkModel.getSubmissionById(req.params.submissionId);

    if (!submission) {
      res.status(404);
      throw new Error('Devoir introuvable.');
    }

    await analysisModel.updateFinalNote(req.params.submissionId, final_note);
    await homeworkModel.updateSubmissionStatus(req.params.submissionId, 'reviewed');

    const updatedSubmission = await homeworkModel.getSubmissionById(req.params.submissionId);

    res.json({
      message: 'Note finale mise a jour avec succes.',
      submission: updatedSubmission
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalysisBySubmission,
  updateFinalNote
};
