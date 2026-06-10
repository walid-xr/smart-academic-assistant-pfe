const notificationModel = require('../models/notificationModel');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationModel.getByUserId(req.user.id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    await notificationModel.markAsRead(req.params.id, req.user.id);

    res.json({
      message: 'Notification marquee comme lue.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead
};
