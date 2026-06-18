const nodemailer = require("nodemailer");

// Create transporter using gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email address",
    text: `Your email verification code is ${otp} it will expires in 10 minutes.`,
    html: `<p>Your email verification code is : <strong>${otp}</strong>.</p>
    <p> It will expires in 10 minutes.</p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification mail sent to ${email}`);
  } catch (err) {
    console.error("Error sending email : ", err);
    throw new Error("Failed to send verification code");
  }
};

module.exports = {
  sendVerificationOTP,
};
