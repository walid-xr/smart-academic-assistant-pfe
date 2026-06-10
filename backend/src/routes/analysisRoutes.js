const express = require('express');
const {
  getAnalysisBySubmission,
  updateFinalNote
} = require('../controllers/analysisController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:submissionId', authenticate, getAnalysisBySubmission);
router.put('/:submissionId/final-note', authenticate, authorizeRoles('teacher'), updateFinalNote);

module.exports = router;

