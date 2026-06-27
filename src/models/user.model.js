const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findUserByUsername = async (username) => {
  const query = "SELECT * FROM users WHERE username = $1";
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

const findUserById = async (userId) => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const registerUser = async (user) => {
  const query =
    "INSERT INTO users (username, email, password_hash, status) VALUES ($1, $2, $3, $4) RETURNING id, username, email, created_at, status";
  const result = await pool.query(query, [
    user.username,
    user.email,
    user.passwordHash,
    "PENDING",
  ]);
  return result.rows[0];
};
const updateUserStatus = async (userId, status) => {
  const query = "UPDATE users SET status = $1 WHERE id = $2";
  await pool.query(query, [status, userId]);
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByUsername,
  registerUser,
  updateUserStatus,
};
