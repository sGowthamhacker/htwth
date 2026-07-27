import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ 
      error: "SMTP configuration missing. Please set SMTP_USER and SMTP_PASS in environment variables." 
    });
  }

  const host = SMTP_HOST || 'smtp.gmail.com';
  const port = SMTP_PORT ? parseInt(SMTP_PORT, 10) : 465;

  const transportConfig: any = {
    host,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false }
  };

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    await transporter.verify();
    res.json({ success: true, message: "SMTP Server is active and ready." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'SMTP verification failed' });
  }
}
