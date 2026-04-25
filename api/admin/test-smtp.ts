import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ override: true });

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

  // DEBUG LOG (Safe: only shows true/false)
  const debugData = {
    HAS_USER: !!process.env.SMTP_USER,
    HAS_PASS: !!process.env.SMTP_PASS,
    USER_TYPE: typeof process.env.SMTP_USER,
    NODE_ENV: process.env.NODE_ENV,
    AVAILABLE_KEYS: Object.keys(process.env).filter(k => k.includes('SMTP') || k.includes('API'))
  };
  console.log("SMTP_ENV_DEBUG_V2:", debugData);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    let missing = [];
    if (!process.env.SMTP_USER) missing.push("SMTP_USER");
    if (!process.env.SMTP_PASS) missing.push("SMTP_PASS");
    
    return res.status(500).json({ 
      error: `SMTP configuration missing: [${missing.join(", ")}]. Found keys: [${debugData.AVAILABLE_KEYS.join(", ")}]`
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    res.status(200).json({ success: true, message: "SMTP Connection Successful!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Connection failed." });
  }
}
