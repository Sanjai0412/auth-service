const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendVerificationOTP = async (toEmail, otpCode) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "PingX",
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: toEmail,
        },
      ],

      subject: "Verify your PingX account",

      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2>Welcome to PingX 👋</h2>

          <p>Your verification code is:</p>

          <h1 style="letter-spacing:5px">${otpCode}</h1>

          <p>This OTP expires in <strong>10 minutes</strong>.</p>

          <p>If you didn't request this email, you can safely ignore it.</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", response);

    return response;
  } catch (err) {
    console.error("❌ Brevo:", err);

    throw err;
  }
};

module.exports = {
  sendVerificationOTP,
};
