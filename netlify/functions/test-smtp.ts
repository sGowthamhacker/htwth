import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "SMTP configuration missing. Please set SMTP_USER and SMTP_PASS." }) 
    };
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
    return { 
      statusCode: 200, 
      body: JSON.stringify({ success: true, message: "SMTP Server is active and ready." }) 
    };
  } catch (error: any) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message || 'SMTP verification failed' }) 
    };
  }
};
