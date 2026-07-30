import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { formatEmailHtml } from '../utils/emailFormatter';

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
      console.warn("SMTP_USER or SMTP_PASS environment variables are not configured correctly on Vercel.");
      return res.status(500).json({ 
        success: false, 
        error: "Email system is not configured on Vercel environment variables (SMTP_USER or SMTP_PASS missing)." 
      });
    }

    const host = (SMTP_HOST || 'smtp.gmail.com').trim().replace(/^["']|["']$/g, '');
    const portStr = (SMTP_PORT || '465').trim().replace(/^["']|["']$/g, '');
    const port = parseInt(portStr, 10);

    const transporter = nodemailer.createTransport({
      host,
      port: port || 465,
      secure: (port || 465) === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 8000
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

    // Send single auto-response email to the sender
    await transporter.sendMail({
      from: `"${SMTP_FROM_NAME || 'Gowtham S'}" <${smtpUser}>`,
      to: email,
      subject: `${name}, thank you for reaching out!`,
      text: `Hello ${name},\n\nThank you for reaching out to me. I have received your message and will get back to you within 24 hours.\n\nBest regards,\nGowtham S`,
      html: autoReplyHtml
    });

    return res.status(200).json({ 
      success: true, 
      autoReplySent: true,
      notifySent: false,
      mailError: null
    });
  } catch (err: any) {
    console.error("Auto-responder SMTP error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err?.message ? `SMTP Error: ${err.message}` : "Email system is currently offline or experiencing issues. Please try again later.",
      mailError: err?.message || String(err)
    });
  }
}

