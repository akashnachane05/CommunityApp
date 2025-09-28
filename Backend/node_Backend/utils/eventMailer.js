const sendEmail = require("./sendEmail"); // your existing email utility

// ============================
// Email Configuration
// ============================
const EMAIL_CONFIG = {
  SUPPORT_EMAIL: "support@vitaa.edu",
  HEADER_COLOR_START: "#4f46e5",
  HEADER_COLOR_END: "#7c3aed",
};

// ============================
// Event Approval Email for Students
// ============================
const getEventApprovalEmailContent = (student, event) => {
  const { title, type, date, mode, meetingLink, location, description } = event;

  const emailText = `
Hi ${student.fullName},

A new event has been approved on VITAA:

Title: ${title}
Type: ${type}
Date: ${new Date(date).toLocaleString()}
mode: ${mode}
Please register to attend this event!

Best regards,
VITAA Team
`;

  const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
      <div style="background:linear-gradient(135deg,${EMAIL_CONFIG.HEADER_COLOR_START} 0%,${EMAIL_CONFIG.HEADER_COLOR_END} 100%);padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">VITAA</h1>
        <p style="color:#e0e7ff;margin:8px 0 0 0;font-size:16px;opacity:0.9;">VIT/VIIT Alumni & Student Network</p>
      </div>
      <div style="padding:40px 32px;">
        <h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;">Hi ${student.fullName}!</h2>
        <p style="color:#4b5563;margin:0 0 24px 0;font-size:16px;line-height:1.6;">
          A new event has just been <strong>approved</strong> on <strong>VITAA</strong>. Please register to attend:
        </p>
        <div style="background-color:#f8fafc;border:2px dashed #d1d5db;border-radius:8px;padding:24px;margin:24px 0;">
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Title:</strong> ${title}</p>
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Type:</strong> ${type}</p>
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Mode:</strong> ${mode}</p>
        </div>
        <p style="color:#4b5563;margin:32px 0 0 0;font-size:16px;line-height:1.6;">
          ${description}
        </p>
      </div>
      <div style="background-color:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;">
        <p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;font-weight:500;">
          Best regards,<br/>
          <span style="color:#4f46e5;font-weight:600;">The VITAA Team</span>
        </p>
        <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px;">
          <p style="color:#6b7280;margin:0;font-size:13px;line-height:1.5;">
            Need help? Contact <a href="mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}" style="color:#4f46e5;text-decoration:none;">${EMAIL_CONFIG.SUPPORT_EMAIL}</a>
          </p>
          <p style="color:#9ca3af;margin:8px 0 0 0;font-size:12px;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  return { emailText, emailHtml, subject: `VITAA - New Event: ${title}` };
};




// ============================
// Event Registration Email for Students
// ============================
const getEventRegistrationEmailContent = (student, event) => {
  const { title, type, date, mode, meetingLink, location } = event;

  const emailText = `
Hi ${student.fullName},

You have successfully registered for the event "${title}".

Event Details:
Title: ${title}
Date: ${new Date(date).toLocaleString()}
Mode: ${mode}
${mode === "Online" ? `Meeting Link: ${meetingLink}` : `Location: ${location}`}

Best regards,
VITAA Team
`;

  const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
      <div style="background:linear-gradient(135deg,${EMAIL_CONFIG.HEADER_COLOR_START} 0%,${EMAIL_CONFIG.HEADER_COLOR_END} 100%);padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">VITAA</h1>
        <p style="color:#e0e7ff;margin:8px 0 0 0;font-size:16px;opacity:0.9;">VIT/VIIT Alumni & Student Network</p>
      </div>
      <div style="padding:40px 32px;">
        <h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;">Hi ${student.fullName}!</h2>
        <p style="color:#4b5563;margin:0 0 24px 0;font-size:16px;line-height:1.6;">
          You have successfully registered for the event "<strong>${title}</strong>".
        </p>
         <div style="background-color:#f8fafc;border:2px dashed #d1d5db;border-radius:8px;padding:24px;margin:24px 0;">
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Title:</strong> ${title}</p>
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Type:</strong> ${type}</p>
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
          <p style="margin:0 0 8px 0;font-size:16px;"><strong>Mode:</strong> ${mode}</p>
        ${mode === "Online" ? `<p style="margin:16px 0 0 0;font-size:16px;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color:${EMAIL_CONFIG.HEADER_COLOR_START};text-decoration:none;">Join Event</a></p>` : `<p style="margin:16px 0 0 0;font-size:16px;"><strong>Location:</strong> ${location}</p>`}
        </div>
        <p style="color:#4b5563;margin:32px 0 0 0;font-size:16px;line-height:1.6;">
          ${description}
        </p>
      </div>
      <div style="background-color:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;">
        <p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;font-weight:500;">
          Best regards,<br/>
          <span style="color:#4f46e5;font-weight:600;">The VITAA Team</span>
        </p>

        <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px;">
          <p style="color:#6b7280;margin:0;font-size:13px;line-height:1.5;">
            Need help? Contact <a href="mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}" style="color:#4f46e5;text-decoration:none;">${EMAIL_CONFIG.SUPPORT_EMAIL}</a>
          </p>
          <p style="color:#9ca3af;margin:8px 0 0 0;font-size:12px;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  return { emailText, emailHtml, subject: `VITAA - Event Registration Confirmed: ${title}` };
};
// ============================
// Event Approval Email for Alumni
// ============================
const getEventApprovalAlumniEmailContent = (alumni, event) => {
  const { title, type, date, mode, meetingLink, location } = event;

  const emailText = `
Hi ${alumni.fullName},

Your event "${title}" has been approved!

Best regards,
VITAA Team
`;

  const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
      <div style="background:linear-gradient(135deg,${EMAIL_CONFIG.HEADER_COLOR_START} 0%,${EMAIL_CONFIG.HEADER_COLOR_END} 100%);padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">VITAA</h1>
        <p style="color:#e0e7ff;margin:8px 0 0 0;font-size:16px;opacity:0.9;">VIT/VIIT Alumni & Student Network</p>
      </div>
      <div style="padding:40px 32px;">
        <h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;">Hi ${alumni.fullName}!</h2>
        <p style="color:#4b5563;margin:0 0 24px 0;font-size:16px;line-height:1.6;">
          Good news! Your event "<strong>${title}</strong>" has been <strong>approved</strong> on VITAA.
        </p>
      </div>
      <div style="background-color:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;">
        <p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;font-weight:500;">
          Best regards,<br/>
          <span style="color:#4f46e5;font-weight:600;">The VITAA Team</span>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  return { emailText, emailHtml, subject: `VITAA - Event Approved: ${title}` };
};
// ============================
// Generate Event REJECTION Email (for Alumni)
// ============================
const getEventRejectionEmailContent = (alumni, event, reason) => {
  const { title } = event;

  const emailText = `
Hi ${alumni.fullName},

Your proposed event "${title}" has been rejected.

Reason: ${reason}

Best regards,
VITAA Team
`;

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VITAA - Event Rejected</title>
</head>
<body style="margin:0;padding:0;background-color:#fff5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">VITAA</h1>
      <p style="color:#fee2e2;margin:8px 0 0 0;font-size:16px;opacity:0.9;">Event Status Update</p>
    </div>

    <!-- Content -->
    <div style="padding:40px 32px;">
      <h2 style="color:#1f2937;margin:0 0 24px 0;font-size:22px;font-weight:600;">Hello ${alumni.fullName},</h2>
      <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
        Unfortunately, your proposed event "<strong>${title}</strong>" has been <span style="color:#dc2626;font-weight:600;">rejected</span>.
      </p>

      <div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:16px 0;border-radius:8px;">
        <p style="margin:0;color:#b91c1c;font-size:16px;"><strong>Reason:</strong> ${reason}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;font-weight:500;">
        Best regards,<br/>
        <span style="color:#4f46e5;font-weight:600;">The VITAA Team</span>
      </p>
    </div>

  </div>
</body>
</html>
`;

  return { emailText, emailHtml, subject: `VITAA - Event "${title}" Rejected` };
};

// ============================
// Send Emails
// ============================
const sendEventApprovalEmail = async (student, event) => {
  const { emailText, emailHtml, subject } = getEventApprovalEmailContent(student, event);
  await sendEmail(student.email, subject, emailText, emailHtml);
};

const sendEventRejectionEmail = async (alumni, event, reason) => {
  const { emailText, emailHtml, subject } = getEventRejectionEmailContent(alumni, event, reason);
  await sendEmail(alumni.email, subject, emailText, emailHtml);
};



const sendEventApprovalAlumniEmail = async (alumni, event) => {
  const { emailText, emailHtml, subject } = getEventApprovalAlumniEmailContent(alumni, event);
  await sendEmail(alumni.email, subject, emailText, emailHtml);
};

const sendEventRegistrationEmail = async (student, event) => {
  const { emailText, emailHtml, subject } = getEventRegistrationEmailContent(student, event);
  await sendEmail(student.email, subject, emailText, emailHtml);
};


module.exports = {
  sendEventRegistrationEmail,
  sendEventApprovalAlumniEmail,
  sendEventApprovalEmail,
  sendEventRejectionEmail,
};
