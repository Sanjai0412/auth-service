const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY, // Grab this from Brevo Dashboard -> SMTP & API
);

export const sendVerificationOtp = async (toEmail, otpCode) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Your Verification OTP";
  sendSmtpEmail.htmlContent = `<p>Your OTP code is: <strong>${otpCode}</strong></p>`;
  sendSmtpEmail.sender = {
    name: "Your App",
    email: process.env.VERIFIED_GMAIL, // Your verified Gmail address in Brevo
  };
  sendSmtpEmail.to = [{ email: toEmail }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("OTP Sent Successfully!", data);
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
  }
};
