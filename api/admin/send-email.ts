import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, text, html, body, senderName } = req.body;
  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, SMTP_FROM_EMAIL, SMTP_FROM_NAME } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ error: "SMTP configuration missing." });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 465,
    secure: (SMTP_PORT ? parseInt(SMTP_PORT, 10) : 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });

  try {
    const finalHtml = html || body;
    const finalSenderName = senderName || SMTP_FROM_NAME || 'Admin';
    
    await transporter.sendMail({
      from: `"${finalSenderName}" <${SMTP_FROM_EMAIL || SMTP_USER}>`,
      to,
      subject,
      text: text || body,
      html: finalHtml
    });
    res.json({ success: true, message: "Email sent successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
