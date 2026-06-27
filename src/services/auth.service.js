const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const refreshTokenModel = require("../models/refreshToken.model");
const emailService = require("../services/email.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const verifyEmail = async (userId, otp) => {
  // Retrieve otp from database
  const otpRecord = await otpModel.findOTPbyUserId(userId);

  if (!otpRecord) {
    throw new Error("Invlaid verification code");
  }
  // Check if the OTP is expired
  const now = new Date();
  if (now > otpRecord.expires_at) {
    // clear the expired OTP from the database
    await otpModel.clearExpiredOTPs();

    throw new Error("Verification code has expired");
  }
  // Update the user's status to "ACTIVE"
  await userModel.updateUserStatus(userId, "ACTIVE");

  // Delete the OTP, so it cant be reused
  await otpModel.deleteOTP(userId);
  return { message: "Email verified successfully" };
};

const register = async (user) => {
  const userExists = await userModel.findUserByEmail(user.email);
  if (userExists) {
    throw new Error("Email is already registered");
  }
  const usernameExists = await userModel.findUserByUsername(user.username);
  if (usernameExists) {
    throw new Error("Username already taken");
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.passwordHash = hash;
  const newUser = await userModel.registerUser(user); // register with PENDING status

  await sendVerificationEmail(newUser.id, newUser.email); // send verification email with OTP

  return newUser;
};

const sendVerificationEmail = async (userId, email) => {
  // generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // set expiration date
  const expiresAt = new Date();
  const expirationDuration = 10;
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationDuration);

  // save to DB
  await otpModel.saveOTP(userId, otp, expiresAt);

  // send OTP via email
  await emailService.sendVerificationOTP(email, otp);
};

const resendOTP = async (userId) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error("User details not found");
  }
  const otp = await otpModel.findOTPbyUserId(userId);
  if (otp && otp.created_at > new Date(Date.now() - 10 * 60 * 1000)) {
    throw new Error("OTP can only be resent after 10 minutes");
  }
  if (user.status === "ACTIVE") {
    throw new Error("Email is already verified");
  }
  // Call the sendVerificationEmail function to resend the OTP
  await sendVerificationEmail(userId, user.email);
  return { message: "Verification OTP sent successfully" };
};

const login = async (email, password) => {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error("User details not found");
  }
  if (user.status == "PENDING") {
    throw new Error("Email already exists, verification pending");
  }
  // compare the input password with hashed password from db
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Incorrect password");
  }

  // JWT token generation
  const payload = {
    userId: user.id,
    username: user.username,
  };

  // Generate access token (15 mins)
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  // Generate refresh token (7 days)
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  // save token on DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  const result = await refreshTokenModel.saveRefreshToken(
    user.id,
    refreshToken,
    expiresAt,
  );
  // Token along with user details
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
};

const logout = async (token, userId) => {
  if (!token) throw new Error("Refresh token is required");

  await refreshTokenModel.deleteRefreshToken(token);
  await userModel.updateUserStatus(userId, "OFFLINE");
  return { message: "User logged out successfully" };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }
  try {
    const tokenRecord = await refreshTokenModel.findRefreshToken(refreshToken);
    const date = new Date();
    if (!tokenRecord || date > tokenRecord.expires_at) {
      throw new Error("Invalid or expired refresh token");
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const payload = {
      userId: decoded.userId,
      username: decoded.username,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    return { accessToken };
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  login,
  logout,
  refresh,
};
