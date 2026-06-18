const pool = require("../config/db");

const findUserByEmail = async (email) => {
  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const registerUser = async (user) => {
  try {
    const query =
      "INSERT INTO users (username, email, password_hash, status) VALUES ($1, $2, $3, $4) RETURNING id, username, email, created_at, status";
    const result = await pool.query(query, [
      user.username,
      user.email,
      user.passwordHash,
      "PENDING",
    ]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};
const updateUserStatus = async (userId, status) => {
  try {
    const query = "UPDATE users SET status = $1 WHERE id = $2";
    const result = await pool.query(query, [status, userId]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  findUserByEmail,
  registerUser,
  updateUserStatus,
};
