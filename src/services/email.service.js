const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationOTP = async (email, otp) => {
  await resend.emails.send({
    from: "PingX <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email",
    html: `
      <h2>PingX Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

module.exports = {
  sendVerificationOTP,
};
