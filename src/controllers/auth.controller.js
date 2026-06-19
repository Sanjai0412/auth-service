const { success } = require("zod");
const authService = require("../services/auth.service");

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = {
      username,
      email,
      password,
    };
    const result = await authService.register(user);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const result = await authService.verifyEmail(userId, otp);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.login(email, password);
    return res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.user.userId;
  try {
    const result = await authService.logout(refreshToken, userId);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const result = await authService.refresh(refreshToken);
    return res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { register, verifyEmail, login, logout, refresh };
