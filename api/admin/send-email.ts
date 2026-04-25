import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ override: true });

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

  const { to, subject, body } = req.body;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ 
      error: "SMTP configuration missing. Please set SMTP_USER and SMTP_PASS in Vercel environment variables." 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const recipients = Array.isArray(to) ? to : [to];
    
    const portalUrls = [
      'https://htwth.vercel.app/',
      'http://writeupportalos.netlify.app/',
      'https://htwth.pages.dev/'
    ];
    
    const sendPromises = recipients.map(recipient => {
      const selectedPortalUrl = portalUrls[Math.floor(Math.random() * portalUrls.length)];

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'HTWTH System'}" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject: subject,
        text: body,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #333333; max-width: 600px; padding: 20px;">
              <div style="white-space: pre-wrap; margin-bottom: 25px;">${body}</div>
              
              <div style="margin-top: 35px;">
                <div style="font-size: 15px; color: #333333; margin-bottom: 15px;">Best regards,</div>
                <div style="font-weight: bold; color: #111111; font-size: 15px; margin-bottom: 2px;">
                  ${process.env.SMTP_FROM_NAME || 'Gowtham'}
                </div>
                <div style="color: #555555; font-size: 14px; margin-bottom: 12px;">
                  Security Research Hub
                </div>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 8px; vertical-align: middle;">
                      <img src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" width="28" height="28" alt="Logo" style="display: block; border-radius: 4px;">
                    </td>
                    <td style="font-weight: 800; font-size: 18px; color: #0f172a; letter-spacing: -0.5px; vertical-align: middle; padding-top: 2px;">
                      HTWTH
                    </td>
                  </tr>
                </table>

                <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #eaeaea;">
                  <div style="color: #64748b; font-size: 11px; font-weight: 800; margin-bottom: 15px; letter-spacing: 1.5px; text-transform: uppercase;">
                    Connect with Me
                  </div>
                  <div style="margin-bottom: 25px;">
                    <a href="https://www.instagram.com/gow.tham__rk?utm_source=qr&igsh=NWpveGJ6eXZ0bWM3" style="text-decoration: none; margin-right: 12px;" target="_blank">
                      <img src="https://img.icons8.com/color/96/instagram-new.png" width="24" height="24" alt="IG" style="display:inline-block;">
                    </a>
                    <a href="https://x.com/hackers_00?t=7NOXZfGHFA37-FPR-iaraA&s=09" style="text-decoration: none; margin-right: 12px;" target="_blank">
                      <img src="https://img.icons8.com/color/96/twitterx--v1.png" width="24" height="24" alt="X" style="display:inline-block;">
                    </a>
                    <a href="https://in.linkedin.com/in/gowtham-s-528631249" style="text-decoration: none; margin-right: 12px;" target="_blank">
                      <img src="https://img.icons8.com/color/96/linkedin.png" width="24" height="24" alt="LI" style="display:inline-block;">
                    </a>
                    <a href="https://wa.me/919346082957" style="text-decoration: none; margin-right: 12px;" target="_blank">
                      <img src="https://img.icons8.com/color/96/whatsapp.png" width="24" height="24" alt="WA" style="display:inline-block;">
                    </a>
                    <a href="mailto:${process.env.SMTP_USER}" style="text-decoration: none; margin-right: 12px;">
                      <img src="https://img.icons8.com/color/96/gmail-new.png" width="24" height="24" alt="Mail" style="display:inline-block;">
                    </a>
                  </div>

                  <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; font-size: 11px; line-height: 1.6; color: #64748b;">
                    <b style="color: #4f46e5;">CAUTION - ENCRYPTED COMMUNICATION:</b> This report contains proprietary security intelligence. Unauthorized distribution is strictly monitored.
                  </div>

                  <div style="color: #94a3b8; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} HackToWriteToHack | ALL RIGHTS RESERVED
                  </div>
                </div>

              </div>
            </div>
        `,
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
