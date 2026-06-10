const express = require('express');
const {
  receiveAnalysisResult,
  getWeeklyReportData
} = require('../controllers/webhookController');
const { verifyN8nSecret } = require('../middleware/n8nMiddleware');

const router = express.Router();

router.post('/analysis-result', verifyN8nSecret, receiveAnalysisResult);
router.get('/weekly-report-data', verifyN8nSecret, getWeeklyReportData);

module.exports = router;
