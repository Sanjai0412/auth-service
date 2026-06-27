const pool = require("../config/db");

const findRefreshToken = async (token) => {
  const query = "SELECT * FROM refresh_tokens WHERE token = $1";
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

const saveRefreshToken = async (userId, refreshToken, expiresAt) => {
  const query =
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING user_id, token";
  const result = await pool.query(query, [userId, refreshToken, expiresAt]);
  return result.rows[0];
};

const deleteRefreshToken = async (token) => {
  const query = "DELETE FROM refresh_tokens WHERE token = $1";
  await pool.query(query, [token]);
};

module.exports = {
  findRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
};
