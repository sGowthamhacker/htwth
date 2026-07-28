import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { to, subject, text, html } = JSON.parse(event.body || '{}');
  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, SMTP_FROM_EMAIL } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return { statusCode: 500, body: JSON.stringify({ error: "SMTP configuration missing." }) };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 465,
    secure: (SMTP_PORT ? parseInt(SMTP_PORT, 10) : 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM_EMAIL || SMTP_USER,
      to,
      subject,
      text,
      html
    });
    return { statusCode: 200, body: JSON.stringify({ success: true, message: "Email sent successfully." }) };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to send email' }) };
  }
};
