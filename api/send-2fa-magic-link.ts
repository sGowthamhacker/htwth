import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code, name } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn('SMTP credentials not configured. Skipping email.');
    return res.json({ success: true, warning: 'SMTP not configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const verifyLink = `${process.env.APP_URL || 'https://ais-dev-fl5m6z2lmsovznnquito44-475153556207.asia-southeast1.run.app'}/verify?email=${encodeURIComponent(email)}&code=${code}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #0f172a;">Secure Login Verification</h2>
        <p style="color: #334155; font-size: 16px;">Hello ${name || 'User'},</p>
        <p style="color: #334155; font-size: 16px;">Click the button below to verify your login or use the code directly:</p>
        <div style="margin: 30px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4f46e5; background: #e0e7ff; padding: 10px 20px; border-radius: 8px;">${code}</span>
        </div>
        <p style="color: #334155; margin-bottom: 24px;">Or use the magic link:</p>
        <a href="${verifyLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Login</a>
        <p style="color: #64748b; font-size: 12px; margin-top: 40px;">If you did not request this verification, please ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'HTWTH System'}" <${smtpUser}>`,
      to: email,
      subject: 'Your Login Verification Code',
      text: `Your verification code is: ${code}\n\nOr click here to verify: ${verifyLink}`,
      html
    });

    return res.json({ success: true, message: 'Verification link sent successfully' });
  } catch (error: any) {
    console.error("2FA Email Error:", error);
    return res.status(500).json({ error: error.message || "Failed to send 2FA email" });
  }
}
