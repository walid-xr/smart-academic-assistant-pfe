const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );

  return rows[0];
};

const createUser = async ({ name, email, password, role }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );

  return {
    id: result.insertId,
    name,
    email,
    role
  };
};

const findTeachers = async () => {
  const [rows] = await pool.query(
    "SELECT id, name, email FROM users WHERE role = 'teacher' ORDER BY name ASC"
  );

  return rows;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  findTeachers
};

