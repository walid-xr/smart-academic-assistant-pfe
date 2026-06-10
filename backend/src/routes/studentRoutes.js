const express = require('express');
const { getProfile, getStudentDashboard } = require('../controllers/studentController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authenticate, authorizeRoles('student'), getProfile);
router.get('/dashboard', authenticate, authorizeRoles('student'), getStudentDashboard);

module.exports = router;

