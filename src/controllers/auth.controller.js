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
      errors: [
        {
          field: "general",
          message: err.message,
        },
      ],
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
      errors: [
        {
          field: "general",
          message: err.message,
        },
      ],
    });
  }
};

const resendOTP = async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await authService.resendOTP(userId);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: [
        {
          field: "general",
          message: err.message,
        },
      ],
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.login(email, password);
    const { user, accessToken, refreshToken } = result;

    // Storing JWT tokens in http cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15mins
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: [
        {
          field: "general",
          message: err.message,
        },
      ],
    });
  }
};
const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const userId = req.user.userId;
  try {
    const result = await authService.logout(refreshToken, userId);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: [
        {
          field: "general",
          message: err.message,
        },
      ],
    });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const result = await authService.refresh(refreshToken);

    const accessToken = result.accessToken;
    // Storing JWT tokens in http cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15mins
    });
    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      errors: [
        {
          field: "general",
          message: err.message,
        },
      ],
    });
  }
};

module.exports = { register, verifyEmail, login, logout, refresh, resendOTP };
