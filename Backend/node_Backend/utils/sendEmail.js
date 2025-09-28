const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // Use your SMTP provider or Gmail for demo
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

async function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: `"VITAA Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html, // <-- Add HTML support
  };
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;