const express = require("express");
const router = express.Router();
const { z } = require("zod");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const authenticateToken = require("../middleware/authenticate");

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const verifySchema = z.object({
  userId: z.string().uuid("Invalid user Id format"),
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
});

const resendOTPSchema = z.object({
  userId: z.string().uuid("Invalid user Id format"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Route for refresh token
router.post("/refresh", validate(refreshSchema), authController.refresh);

// A protected route to test if JWT auth works or not
router.get("/me", authenticateToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Token verified successfully",
    user: req.user,
  });
});

router.post("/verify", validate(verifySchema), authController.verifyEmail);
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/logout",
  authenticateToken,
  validate(refreshSchema),
  authController.logout,
);
router.post("/resend-otp", validate(resendOTPSchema), authController.resendOTP);

module.exports = router;
