import nodemailer from "nodemailer";

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587"),
    secure: parseInt(SMTP_PORT || "587") === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const STATUS_SUBJECTS = {
  Reviewed: "Your application is being reviewed",
  Accepted: "Congratulations! Your application has been accepted",
  Rejected: "Update on your job application",
  Applied: "Application status updated",
};

const STATUS_MESSAGES = {
  Reviewed: (name, jobTitle, company) =>
    `Hi ${name},\n\nGreat news! Your application for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> is currently being reviewed by our team.\n\nWe'll be in touch with further updates soon.\n\nBest regards,\n${company}`,
  Accepted: (name, jobTitle, company) =>
    `Hi ${name},\n\nCongratulations! We are thrilled to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> has been <strong>accepted</strong>.\n\nOur team will be reaching out to you shortly with next steps.\n\nBest regards,\n${company}`,
  Rejected: (name, jobTitle, company) =>
    `Hi ${name},\n\nThank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${company}</strong>. After careful consideration, we have decided to move forward with other candidates at this time.\n\nWe appreciate the time you invested in applying and encourage you to apply for future openings.\n\nBest regards,\n${company}`,
  Applied: (name, jobTitle, company) =>
    `Hi ${name},\n\nYour application status for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> has been updated.\n\nBest regards,\n${company}`,
};

const buildHtml = (name, jobTitle, company, status, bodyText) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a2e; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .status-badge { display: inline-block; margin-top: 12px; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;
      background: ${status === "Accepted" ? "#10b981" : status === "Rejected" ? "#ef4444" : status === "Reviewed" ? "#f59e0b" : "#3b82f6"};
      color: #ffffff;
    }
    .body { padding: 36px 40px; color: #374151; line-height: 1.7; font-size: 15px; }
    .footer { background: #f9fafb; padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Status Update</h1>
      <span class="status-badge">${status}</span>
    </div>
    <div class="body">
      ${bodyText.replace(/\n/g, "<br>").replace(/<strong>/g, "<strong>").replace(/<\/strong>/g, "</strong>")}
    </div>
    <div class="footer">
      This is an automated notification from the Job Application Platform.
    </div>
  </div>
</body>
</html>
`;

export const sendStatusNotification = async ({ applicantEmail, applicantName, jobTitle, company, status }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("Email not configured — skipping notification (set SMTP_HOST, SMTP_USER, SMTP_PASS to enable)");
    return { skipped: true };
  }

  const subject = STATUS_SUBJECTS[status] || "Application status updated";
  const bodyText = STATUS_MESSAGES[status]
    ? STATUS_MESSAGES[status](applicantName, jobTitle, company)
    : `Hi ${applicantName},\n\nYour application status for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated to: ${status}.`;

  const html = buildHtml(applicantName, jobTitle, company, status, bodyText);
  const text = bodyText.replace(/<[^>]+>/g, "");

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Job Application Platform" <${fromAddress}>`,
    to: applicantEmail,
    subject,
    text,
    html,
  });

  console.log(`Status notification sent to ${applicantEmail} [${status}]`);
  return { sent: true, to: applicantEmail };
};
