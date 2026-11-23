let nodemailer = null;
const loadNodemailer = async () => {
  if (nodemailer) return nodemailer;
  try {
    const mod = await import('nodemailer');
    nodemailer = mod.default || mod;
    return nodemailer;
  } catch (err) {
    console.warn('[EmailService] nodemailer not installed or unavailable, using console fallback.');
    return null;
  }
};

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;
  const mailerLib = await loadNodemailer();
  if (!mailerLib) return null;

  // 1. Configured SMTP host
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = mailerLib.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // 2. Direct Gmail / service transport if EMAIL_USER and EMAIL_PASS set
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = mailerLib.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return transporter;
  }

  // 3. Fallback: Create Ethereal test account automatically for local development
  try {
    const testAccount = await mailerLib.createTestAccount();
    transporter = mailerLib.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[EmailService] Initialized Ethereal test mailer for ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.warn('[EmailService] Could not initialize Ethereal mailer, using console fallback:', err.message);
    return null;
  }
};

/**
 * Send an email notification when a collaboration request is sent
 */
export const sendCollaborationEmail = async ({
  toEmail,
  receiverName,
  senderName,
  message,
  projectTitle,
}) => {
  if (!toEmail) {
    console.warn('[EmailService] Cannot send email: recipient email missing');
    return { success: false, reason: 'missing_recipient_email' };
  }

  const subject = `🚀 New Collaboration Request from ${senderName} on DevHub!`;
  const textContent = `Hi ${receiverName || 'Developer'},\n\n${senderName} has sent you a collaboration request for "${projectTitle || 'DevHub Project'}".\n\nMessage:\n"${message}"\n\nLog in to your DevHub workspace to view and respond:\n${process.env.CLIENT_URL || 'http://localhost:5173'}/app/requests\n\nHappy building,\nThe DevHub Team`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 32px 20px; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 44px; height: 44px; background: linear-gradient(135deg, #7c3aed, #0284c7); border-radius: 12px; line-height: 44px; font-size: 22px; color: #ffffff; text-align: center; margin-bottom: 10px;">⚡</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">DevHub</h1>
        <p style="color: #94a3b8; margin-top: 4px; font-size: 13px;">Developer Portfolio & Collaboration Matchmaking</p>
      </div>

      <div style="background-color: #111827; padding: 24px; border-radius: 12px; border: 1px solid #1f2937; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);">
        <div style="display: inline-block; padding: 4px 10px; background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 20px; font-size: 12px; color: #a78bfa; font-weight: 600; margin-bottom: 12px;">
          Incoming Request
        </div>
        <h2 style="color: #38bdf8; margin: 0 0 12px 0; font-size: 20px;">You've Been Invited to Collaborate!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px;">
          <strong>${senderName}</strong> wants to collaborate with you on <strong style="color: #a78bfa;">${projectTitle || 'a DevHub Project'}</strong>.
        </p>
        <div style="background-color: #0b0f19; border-left: 4px solid #7c3aed; padding: 14px 16px; margin: 16px 0; border-radius: 6px; font-style: italic; color: #94a3b8; font-size: 14px;">
          "${message}"
        </div>
        <div style="text-align: center; margin-top: 26px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/app/requests" style="background: linear-gradient(135deg, #7c3aed, #0284c7); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);">
            Open Requests & Respond
          </a>
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center;">
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          Sent to <strong>${toEmail}</strong> because you are a registered developer on DevHub.
        </p>
      </div>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    if (mailer) {
      const info = await mailer.sendMail({
        from: '"DevHub Collaboration" <no-reply@devhub.dev>',
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[EmailService] Collaboration email sent to ${toEmail}. Message ID: ${info.messageId}`);
      let previewUrl = null;
      try {
        if (nodemailer && typeof nodemailer.getTestMessageUrl === 'function') {
          previewUrl = nodemailer.getTestMessageUrl(info);
          if (previewUrl) {
            console.log(`[EmailService] ✉️ Ethereal Live Email Preview: ${previewUrl}`);
          }
        }
      } catch (_) {}
      return { success: true, messageId: info.messageId, previewUrl };
    } else {
      console.log(`[EmailService] [CONSOLE DISPATCH] To: ${toEmail} | Subject: ${subject}\nBody: ${textContent}`);
      return { success: true, consoleOnly: true };
    }
  } catch (err) {
    console.error('[EmailService] Error sending collaboration email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send an email notification when a request is accepted or declined
 */
export const sendRequestDecisionEmail = async ({
  toEmail,
  senderName,
  responderName,
  status,
  projectTitle,
}) => {
  if (!toEmail) return { success: false, reason: 'missing_email' };

  const isAccepted = status === 'accepted';
  const subject = isAccepted
    ? `🎉 ${responderName} accepted your collaboration request on DevHub!`
    : `Update on your collaboration request to ${responderName}`;

  const textContent = `Hi ${senderName || 'Developer'},\n\n${responderName} has ${status} your collaboration request for "${projectTitle || 'DevHub Project'}".\n\nLog in to your DevHub workspace to connect:\n${process.env.CLIENT_URL || 'http://localhost:5173'}/app/requests\n\nHappy building,\nThe DevHub Team`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 32px 20px; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">DevHub</h1>
        <p style="color: #94a3b8; margin-top: 4px; font-size: 13px;">Collaboration Matchmaking</p>
      </div>
      <div style="background-color: #111827; padding: 24px; border-radius: 12px; border: 1px solid #1f2937;">
        <h2 style="color: ${isAccepted ? '#22c55e' : '#94a3b8'}; margin: 0 0 12px 0; font-size: 20px;">
          ${isAccepted ? 'Request Accepted! 🎉' : 'Request Update'}
        </h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          <strong>${responderName}</strong> has <strong>${status}</strong> your collaboration request for <strong>${projectTitle || 'DevHub project'}</strong>.
        </p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/app/requests" style="background: linear-gradient(135deg, #7c3aed, #0284c7); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; display: inline-block;">
            View Connected Teammates
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    if (mailer) {
      const info = await mailer.sendMail({
        from: '"DevHub Collaboration" <no-reply@devhub.dev>',
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      let previewUrl = null;
      try {
        if (nodemailer && typeof nodemailer.getTestMessageUrl === 'function') {
          previewUrl = nodemailer.getTestMessageUrl(info);
        }
      } catch (_) {}
      return { success: true, messageId: info.messageId, previewUrl };
    }
  } catch (err) {
    console.error('[EmailService] Error sending decision email:', err.message);
  }
  return { success: false };
};
