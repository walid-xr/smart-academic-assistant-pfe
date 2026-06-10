const express = require('express');
const {
  registerStudent,
  registerTeacher,
  login,
  getCurrentUser
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register/student', registerStudent);
router.post('/register/teacher', registerTeacher);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;

