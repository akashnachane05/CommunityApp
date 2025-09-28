const sendEmail = require('./sendEmail'); // your existing email utility

// ============================
// Email Configuration
// ============================
const EMAIL_CONFIG = {
  SUPPORT_EMAIL: "support@vitaa.edu",
  HEADER_COLOR_START: "#4f46e5",
  HEADER_COLOR_END: "#7c3aed",
};

// ============================
// Generate Job Notification Email
// ============================
const getJobEmailContent = (student, job) => {
  const { title, company, location, type, applyLink } = job;

  const emailText = `
Hi ${student.fullName},

An alumni has posted a new job opportunity on VITAA:

Title: ${title}
Company: ${company}
Location: ${location}
Type: ${type}
Apply here: ${applyLink}

Don't miss out!

Best regards,
VITAA Team
`;

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VITAA - New Job Posted</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${EMAIL_CONFIG.HEADER_COLOR_START} 0%,${EMAIL_CONFIG.HEADER_COLOR_END} 100%);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">VITAA</h1>
      <p style="color:#e0e7ff;margin:8px 0 0 0;font-size:16px;opacity:0.9;">VIT/VIIT Alumni & Student Network</p>
    </div>

    <!-- Content -->
    <div style="padding:40px 32px;">
      <h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;">Hi ${student.fullName}!</h2>
      <p style="color:#4b5563;margin:0 0 24px 0;font-size:16px;line-height:1.6;">
        An alumni has just posted a new job opportunity on <strong>VITAA</strong> that might interest you:
      </p>

      <!-- Job Info -->
      <div style="background-color:#f8fafc;border:2px dashed #d1d5db;border-radius:8px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 8px 0;font-size:16px;"><strong>Title:</strong> ${title}</p>
        <p style="margin:0 0 8px 0;font-size:16px;"><strong>Company:</strong> ${company}</p>
        <p style="margin:0 0 8px 0;font-size:16px;"><strong>Location:</strong> ${location}</p>
        <p style="margin:0 0 8px 0;font-size:16px;"><strong>Type:</strong> ${type}</p>
        <p style="margin:16px 0 0 0;font-size:16px;"><strong>Apply Here:</strong> <a href="${applyLink}" style="color:${EMAIL_CONFIG.HEADER_COLOR_START};text-decoration:none;">Click to Apply</a></p>
      </div>

      <p style="color:#4b5563;margin:32px 0 0 0;font-size:16px;line-height:1.6;">
        Don't miss out on this opportunity to kickstart or advance your career!
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

  return { emailText, emailHtml, subject: `VITAA - New Job Opportunity: ${title}` };
};

// ============================
// Send Job Email
// ============================
const sendJobEmail = async (student, job) => {
  const { emailText, emailHtml, subject } = getJobEmailContent(student, job);
  await sendEmail(student.email, subject, emailText, emailHtml);
};

module.exports = { getJobEmailContent, sendJobEmail };
