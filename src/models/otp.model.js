const pool = require("../config/db");

const saveOTP = async (userId, code, expiresAt) => {
  try {
    const query =
      "INSERT INTO otps (user_id, code, expires_at) VALUES ($1, $2, $3)";
    const result = await pool.query(query, [userId, code, expiresAt]);
  } catch (err) {
    throw err;
  }
};

const findOTP = async (userId, code) => {
  try {
    const query = "SELECT * FROM otps WHERE user_id = $1 AND code = $2";
    const result = await pool.query(query, [userId, code]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

const deleteOTP = async (userId) => {
  try {
    const query = "DELETE FROM otps WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
  } catch (err) {
    throw err;
  }
};

const clearExpiredOTPs = async () => {
  try {
    const query = "DELETE FROM otps WHERE expires_at < NOW()";
    const result = await pool.query(query);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  saveOTP,
  findOTP,
  deleteOTP,
  clearExpiredOTPs,
};