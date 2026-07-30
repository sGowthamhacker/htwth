import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

function formatEmailHtml(rawBody: string, senderName: string = 'HTWTH'): string {
  if (!rawBody) return '';

  let cleanSender = senderName ? senderName.trim() : 'HTWTH';
  if (cleanSender === 'Gowtham S Admin' || cleanSender === 'Gowtham S Admin System' || cleanSender === 'System' || cleanSender === 'admin' || !cleanSender) {
    cleanSender = 'HTWTH';
  }

  const outerBg = '#f8fafc';
  const cardBg = '#ffffff';
  const cardBorder = '#e2e8f0';
  const sigBg = '#ffffff';
  const sigTextMuted = '#64748b';
  const sigTextHeading = '#0f172a';
  const sigSubText = '#64748b';
  const sigBorderTop = '#e2e8f0';
  const sigCardBorder = '#e2e8f0';
  const sigCautionBg = '#f8fafc';
  const sigCautionBorder = '#cbd5e1';

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${outerBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 10px; width: 100%; table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); word-break: break-word; overflow-wrap: break-word; table-layout: fixed;">
            <tr>
              <td style="padding: 0; background-color: ${cardBg}; word-break: break-word; overflow-wrap: break-word;">
                ${rawBody}
              </td>
            </tr>
            <tr>
              <td style="border-top: 1px solid ${sigBorderTop}; padding: 22px 20px; background-color: ${sigBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: left;">
                <div style="font-size: 13px; color: ${sigTextMuted}; margin-bottom: 4px;">Best regards,</div>
                <div style="font-weight: 800; color: ${sigTextHeading}; font-size: 15px; margin-bottom: 4px; letter-spacing: -0.2px;">Gowtham S Admin</div>
                <div style="color: ${sigSubText}; font-size: 12px; margin-bottom: 16px;">Security Research Hub</div>

                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                  <tr>
                    <td style="padding-right: 10px; vertical-align: middle;">
                      <img src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" width="26" height="26" alt="Logo" style="display: block; border-radius: 4px;">
                    </td>
                    <td style="font-weight: 800; font-size: 16px; color: ${sigTextHeading}; letter-spacing: -0.5px; vertical-align: middle;">
                      HTWTH
                    </td>
                  </tr>
                </table>

                <div style="border-top: 1px solid ${sigCardBorder}; padding-top: 16px; margin-top: 14px;">
                  <div style="color: ${sigSubText}; font-size: 11px; font-weight: 800; margin-bottom: 10px; letter-spacing: 0.8px; text-transform: uppercase;">
                    Connect with Me
                  </div>
                  <div style="margin-bottom: 16px;">
                    <a href="https://www.instagram.com/gow.tham__rk?utm_source=qr&igsh=NWpveGJ6eXZ0bWM3" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/instagram-new.png" width="22" height="22" alt="IG" style="vertical-align: middle;">
                    </a>
                    <a href="https://x.com/hackers_00?t=7NOXZfGHFA37-FPR-iaraA&s=09" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/twitterx--v1.png" width="22" height="22" alt="X" style="vertical-align: middle;">
                    </a>
                    <a href="https://in.linkedin.com/in/gowtham-s-528631249" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/linkedin.png" width="22" height="22" alt="LI" style="vertical-align: middle;">
                    </a>
                    <a href="https://wa.me/919346082957" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/whatsapp.png" width="22" height="22" alt="WA" style="vertical-align: middle;">
                    </a>
                    <a href="mailto:gowlearner04@gmail.com" style="text-decoration: none; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/gmail-new.png" width="22" height="22" alt="Mail" style="vertical-align: middle;">
                    </a>
                  </div>

                  <div style="background-color: ${sigCautionBg}; padding: 10px 14px; border-radius: 8px; border: 1px solid ${sigCautionBorder}; margin-bottom: 14px; font-size: 11px; line-height: 1.5; color: ${sigSubText};">
                    <b style="color: #6366f1;">CAUTION - ENCRYPTED COMMUNICATION:</b> This report contains proprietary security intelligence. Unauthorized distribution is strictly monitored.
                  </div>

                  <div style="color: ${sigSubText}; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} HTWTH | ALL RIGHTS RESERVED
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `.trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure JSON content-type header is always set
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const { name, email, message } = body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields: name, email, message." });
    }

    const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, SMTP_FROM_NAME, APP_URL } = process.env;

    const smtpUser = (SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
    const smtpPass = (SMTP_PASS || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

    if (!smtpUser || !smtpPass) {
      console.warn("SMTP_USER or SMTP_PASS environment variables are not configured in Vercel settings.");
      return res.status(200).json({ 
        success: true, 
        autoReplySent: false,
        notifySent: false,
        message: "Message received successfully.",
        mailError: "SMTP credentials not configured"
      });
    }

    const host = (SMTP_HOST || 'smtp.gmail.com').trim().replace(/^["']|["']$/g, '');
    const portStr = (SMTP_PORT || '465').trim().replace(/^["']|["']$/g, '');
    const port = parseInt(portStr, 10) || 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    const appUrl = APP_URL || (hostHeader ? `${protocol}://${hostHeader}` : 'https://htwth.vercel.app/');

    const rawBodyHtml = `
      <div style="text-align: left; padding: 24px 20px; color: #1e293b; width: 100%; max-width: 100%; box-sizing: border-box; word-break: break-word; overflow-wrap: break-word;">
        <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Hello ${name},</p>
        
        <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
          Thank you for reaching out! I have received your message and will review it as soon as possible.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;"><p style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">MESSAGE DETAILS</p><p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"${message}"</p></div>

        <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">
          Check out our website for updates:<br/>
          <a href="${appUrl}" style="color: #6366f1; font-weight: 600; text-decoration: none; word-break: break-all; overflow-wrap: anywhere; display: inline-block; max-width: 100%; margin-top: 4px;">${appUrl}</a>
        </p>
      </div>
    `;

    const autoReplyHtml = formatEmailHtml(rawBodyHtml, SMTP_FROM_NAME || 'Gowtham S');

    // Single process: send automated auto-reply to the user
    let autoReplySent = false;
    let mailError: string | null = null;
    try {
      await transporter.sendMail({
        from: `"${SMTP_FROM_NAME || 'Gowtham S'}" <${smtpUser}>`,
        to: email,
        subject: `${name}, thank you for reaching out!`,
        text: `Hello ${name},\n\nThank you for reaching out to me. I have received your message and will get back to you within 24 hours.\n\nBest regards,\nGowtham S`,
        html: autoReplyHtml
      });
      autoReplySent = true;
    } catch (mailErr: any) {
      console.error("SMTP delivery failed:", mailErr);
      mailError = mailErr?.message || String(mailErr);
    }

    return res.status(200).json({ 
      success: true, 
      autoReplySent,
      notifySent: false,
      mailError
    });
  } catch (err: any) {
    console.error("Auto-responder endpoint error:", err);
    return res.status(200).json({ 
      success: true, 
      autoReplySent: false,
      notifySent: false,
      mailError: err?.message || String(err)
    });
  }
}

