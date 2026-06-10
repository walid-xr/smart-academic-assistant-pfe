const { pool } = require('../config/db');

const createNotification = async ({ userId, type, message }) => {
  await pool.query(
    'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
    [userId, type, message]
  );
};

const getByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, type, message, is_read, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};

const markAsRead = async (notificationId, userId) => {
  await pool.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
};

module.exports = {
  createNotification,
  getByUserId,
  markAsRead
};
