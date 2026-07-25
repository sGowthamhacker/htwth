import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { formatEmailHtml } from '../../utils/emailFormatter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, body, senderName } = req.body;

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

    const recipients = Array.isArray(to) ? to : [to];
    const rawSender = senderName || process.env.SENDER_NAME || process.env.SMTP_FROM_NAME;
    let actualSenderName = rawSender ? rawSender.trim() : 'Gowtham S Admin';
    if (actualSenderName === 'HTWTH' || actualSenderName === 'HTWTH System' || actualSenderName === 'System' || actualSenderName === 'admin' || !actualSenderName) {
      actualSenderName = 'Gowtham S Admin';
    }
    const htmlFormatted = formatEmailHtml(body || '', actualSenderName);
    
    const sendPromises = recipients.map(recipient => {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'HTWTH System'}" <${user}>`,
        to: recipient,
        subject: subject,
        text: body,
        html: htmlFormatted,
      };
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(sendPromises);
    res.status(200).json({ success: true, message: `Successfully sent ${recipients.length} individual email(s).` });
  } catch (error: any) {
    console.error("Mail Error:", error);
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
}

