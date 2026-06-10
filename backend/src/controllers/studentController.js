const assignmentModel = require('../models/assignmentModel');
const studentModel = require('../models/studentModel');

const getProfile = async (req, res, next) => {
  try {
    const student = await studentModel.findByUserId(req.user.id);

    if (!student) {
      res.status(404);
      throw new Error('Profil etudiant introuvable.');
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await studentModel.findByUserId(req.user.id);

    if (!student) {
      res.status(404);
      throw new Error('Profil etudiant introuvable.');
    }

    const [stats, recentSubmissions, assignmentStats] = await Promise.all([
      studentModel.getStudentStats(student.id),
      studentModel.getRecentSubmissions(student.id),
      assignmentModel.countOpenAssignmentsForStudent(student.id)
    ]);

    res.json({
      student,
      stats: {
        total_submissions: Number(stats.total_submissions || 0),
        reviewed_count: Number(stats.reviewed_count || 0),
        average_score: Number(stats.average_score || 0),
        flagged_count: Number(stats.flagged_count || 0),
        available_assignments: Number(assignmentStats.available_assignments || 0),
        answered_assignments: Number(assignmentStats.answered_assignments || 0)
      },
      recent_submissions: recentSubmissions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getStudentDashboard
};
