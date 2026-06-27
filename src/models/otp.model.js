const pool = require("../config/db");

const saveOTP = async (userId, code, expiresAt) => {
  const query =
    "INSERT INTO otps (user_id, code, expires_at) VALUES ($1, $2, $3)";
  await pool.query(query, [userId, code, expiresAt]);
};

const findOTPbyUserId = async (userId) => {
  const query = "SELECT * FROM otps WHERE user_id = $1";
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const deleteOTP = async (userId) => {
  const query = "DELETE FROM otps WHERE user_id = $1";
  await pool.query(query, [userId]);
};

const clearExpiredOTPs = async () => {
  const query = "DELETE FROM otps WHERE expires_at < NOW()";
  await pool.query(query);
};

module.exports = {
  saveOTP,
  findOTPbyUserId,
  deleteOTP,
  clearExpiredOTPs,
};
