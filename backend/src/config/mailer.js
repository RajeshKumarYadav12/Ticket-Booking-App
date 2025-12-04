const sgMail = require("@sendgrid/mail");

const configureMailer = () => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("SendGrid configured successfully");
  } else {
    console.warn(
      "SendGrid API key not found. Email notifications will be logged to console only."
    );
  }
};

module.exports = configureMailer;
