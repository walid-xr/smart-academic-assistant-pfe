const express = require('express');
const {
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
} = require('../controllers/homeworkController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadHomework } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/assignments', authenticate, getAssignments);
router.get('/assignments/:id', authenticate, getAssignmentDetails);
router.post(
  '/assignments',
  authenticate,
  authorizeRoles('teacher'),
  uploadHomework.single('assignment_file'),
  createAssignment
);
router.put(
  '/assignments/:id/status',
  authenticate,
  authorizeRoles('teacher'),
  updateAssignmentStatus
);
router.delete(
  '/assignments/:id',
  authenticate,
  authorizeRoles('teacher'),
  deleteAssignment
);
router.post(
  '/assignments/:id/submit',
  authenticate,
  authorizeRoles('student'),
  uploadHomework.single('file'),
  submitAssignmentAnswers
);
router.get('/', authenticate, getHomeworkList);
router.get('/dashboard/teacher', authenticate, authorizeRoles('teacher'), getTeacherDashboard);
router.get('/:id', authenticate, getHomeworkDetails);
router.post(
  '/',
  authenticate,
  authorizeRoles('student'),
  uploadHomework.single('file'),
  submitHomework
);
router.put('/:id/review', authenticate, authorizeRoles('teacher'), markHomeworkAsReviewed);
router.delete('/:id', authenticate, authorizeRoles('teacher'), deleteHomework);

module.exports = router;
