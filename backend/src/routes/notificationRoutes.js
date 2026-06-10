const express = require('express');
const {
  getNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markNotificationAsRead);

module.exports = router;

