import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const user = (process.env.SMTP_USER || 'ragow49@gmail.com').trim();
    const pass = (process.env.SMTP_PASS || 'clfuqmldpuezhslv').replace(/\s+/g, '');
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const portStr = process.env.SMTP_PORT || '465';
    const port = parseInt(portStr, 10);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    await transporter.verify();
    res.status(200).json({ success: true, message: "SMTP Connection Successful!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Connection failed." });
  }
}
