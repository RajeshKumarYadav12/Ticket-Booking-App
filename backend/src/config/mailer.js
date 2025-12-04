const sgMail = require("@sendgrid/mail");

const configureMailer = () => {
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith("SG.")) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log("SendGrid configured successfully");
    } catch (error) {
      console.warn(`SendGrid configuration error: ${error.message}`);
    }
  } else {
    console.warn(
      "SendGrid API key not found or invalid. Email notifications will be disabled."
    );
  }
};

module.exports = configureMailer;
