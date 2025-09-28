// utils/verification.js
const sendEmail = require('./sendEmail'); // your existing email utility

// ============================
// Email Configuration
// ============================
const EMAIL_CONFIG = {
  SUBJECT: "VITAA - Email Verification Required",
  EXPIRY_MINUTES: 10,
  SUPPORT_EMAIL: "support@vitaa.edu",
};

// ============================
// Generate a secure 6-digit verification code
// ============================
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================
// Generate Email Content
// ============================
const getVerificationEmailContent = (user, verificationCode) => {
  const emailText = `
Dear ${user.fullName},

Welcome to VITAA (VIT/VIIT Alumni & Student Network)!

Your email verification code is: ${verificationCode}

This code will expire in ${EMAIL_CONFIG.EXPIRY_MINUTES} minutes.

If you did not request this verification, please ignore this email or contact our support team.

Best regards,
The VITAA Team

---
For assistance, please contact: ${EMAIL_CONFIG.SUPPORT_EMAIL}
`;

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VITAA Email Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">VITAA</h1>
      <p style="color:#e0e7ff;margin:8px 0 0 0;font-size:16px;opacity:0.9;">VIT/VIIT Alumni & Student Network</p>
    </div>

    <!-- Content -->
    <div style="padding:40px 32px;">
      <h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;">Welcome, ${user.fullName}!</h2>
      <p style="color:#4b5563;margin:0 0 24px 0;font-size:16px;line-height:1.6;">
        Thank you for joining the VITAA platform. To complete your registration and secure your account, please verify your email address using the code below.
      </p>

      <!-- Verification Code -->
      <div style="background-color:#f8fafc;border:2px dashed #d1d5db;border-radius:8px;padding:32px;text-align:center;margin:32px 0;">
        <p style="color:#6b7280;margin:0 0 16px 0;font-size:14px;font-weight:500;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
        <div style="font-size:36px;font-weight:700;color:#4f46e5;letter-spacing:8px;font-family:'Courier New',monospace;">
          ${verificationCode}
        </div>
      </div>

      <!-- Instructions -->
      <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;margin:24px 0;border-radius:0 6px 6px 0;">
        <h3 style="color:#92400e;margin:0 0 12px 0;font-size:16px;font-weight:600;">Important Information:</h3>
        <ul style="color:#92400e;margin:0;padding-left:20px;font-size:14px;line-height:1.5;">
          <li style="margin-bottom:8px;">This verification code expires in <strong>${EMAIL_CONFIG.EXPIRY_MINUTES} minutes</strong></li>
          <li style="margin-bottom:8px;">Enter this code in the VITAA app to activate your account</li>
          <li>If you didn't request this verification, please ignore this email</li>
        </ul>
      </div>

      <p style="color:#4b5563;margin:32px 0 0 0;font-size:16px;line-height:1.6;">
        We're excited to have you as part of our alumni and student community!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;font-weight:500;">
        Best regards,<br/>
        <span style="color:#4f46e5;font-weight:600;">The VITAA Team</span>
      </p>
      <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px;">
        <p style="color:#6b7280;margin:0;font-size:13px;line-height:1.5;">
          Need help? Contact our support team at 
          <a href="mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}" style="color:#4f46e5;text-decoration:none;">${EMAIL_CONFIG.SUPPORT_EMAIL}</a>
        </p>
        <p style="color:#9ca3af;margin:8px 0 0 0;font-size:12px;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    </div>

  </div>
</body>
</html>
`;

  return { emailText, emailHtml, subject: EMAIL_CONFIG.SUBJECT };
};

// ============================
// Send Verification Email
// ============================
const sendVerificationEmail = async (user) => {
  const code = generateVerificationCode();
  const { emailText, emailHtml, subject } = getVerificationEmailContent(user, code);

  // Save verification info to user
  user.verificationCode = code;
  user.verificationCodeExpires = Date.now() + EMAIL_CONFIG.EXPIRY_MINUTES * 60 * 1000;
  user.verified = false;
  await user.save();

  // Send email
  await sendEmail(user.email, subject, emailText, emailHtml);
  return code;
};

module.exports = { generateVerificationCode, sendVerificationEmail, getVerificationEmailContent };
