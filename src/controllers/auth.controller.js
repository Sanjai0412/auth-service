const authService = require("../services/auth.service");

const isProduction = process.env.NODE_ENV === "production";

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

    // Storing JWT long lived refresh token in http-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Sending JWT short lived access token in response body (client stores & sends via Authorization header)
    return res.status(200).json({
      success: true,
      accessToken,
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

    // Sending new access token in response body (client stores & sends via Authorization header)
    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
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
