
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import QRCode from "qrcode";

// Force load from .env, overriding any sticky/stuck platform secrets
dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log incoming requests
  app.use((req, res, next) => {
    if (req.url.includes('manifest')) {
      console.log(`[REQ] ${req.method} ${req.url} - Headers:`, req.headers['accept']);
    }
    next();
  });

  // --- DEBUG LOGGING START ---
  const isProd = process.env.NODE_ENV === "production" || process.env.FORCE_PROD === "true";
  console.log("--- SYSTEM ENVIRONMENT CHECK ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("EFFECTIVE MODE:", isProd ? "PRODUCTION" : "DEVELOPMENT (VITE)");
  console.log("SMTP_USER:", process.env.SMTP_USER ? (process.env.SMTP_USER.includes('@') ? "VALID EMAIL" : `INVALID: ${process.env.SMTP_USER}`) : "MISSING");
  console.log("APP_URL:", process.env.APP_URL);
  console.log("--------------------------------");
  // --- DEBUG LOGGING END ---

  // Important: serve manifest and sw from root if requested, 
  // helping solve the "Syntax Error" if middleware fallback is too aggressive
  app.get('/manifest.json', (req, res) => {
    res.header('Content-Type', 'application/manifest+json');
    const folder = isProd ? 'dist' : 'public';
    res.sendFile(path.resolve(process.cwd(), folder, 'manifest.json'));
  });

  app.get('/sw.js', (req, res) => {
    res.header('Content-Type', 'application/javascript');
    const folder = isProd ? 'dist' : 'public';
    res.sendFile(path.resolve(process.cwd(), folder, 'sw.js'));
  });

  // New API Route for fetching Gemini Key (Local Sync)
  app.get("/api/get-api-key", (req, res) => {
    const apiKey = process.env.API_KEY || "AIzaSyBujCiuNzlUvP1q561-I5TboqtCzJhZc3Y";
    res.json({ apiKey });
  });

  // Contact Form Auto-responder SMTP Integration
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields: name, email, message." });
    }

    // Default response status
    let autoReplySent = false;
    let notifySent = false;
    let mailError = null;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const user = (process.env.SMTP_USER || '').trim();
        const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user,
            pass,
          },
        });

        // Generate QR/barcode buffer containing friendly textual details
        const qrText = `Contact Name: ${name}\nContact Email: ${email}\nMessage:\n${message}`;
        const qrBuffer = await QRCode.toBuffer(qrText, {
          margin: 1,
          width: 250,
          color: {
            dark: '#1e1b4b', // deep indigo
            light: '#ffffff'
          }
        });

        // 1. Send polished Auto-Response "Thank you for contacting us" to the sender with friendly normal words + barcode QR
        const autoReplyHtml = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 16px;">
              <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -1px;">HTWTH</span>
            </div>

            <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 12px;">Hello ${name},</p>
            
            <p style="margin-bottom: 16px; color: #334155;">
              Thank you so much for reaching out to me! I have received your message and will review it as soon as possible. I usually reply within 24 hours.
            </p>

            <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 800; color: #4f46e5; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Message Details</div>
              <div style="font-size: 13px; color: #475569; margin-bottom: 4px;"><b>Your Name:</b> ${name}</div>
              <div style="font-size: 13px; color: #475569; margin-bottom: 4px;"><b>Your Email:</b> ${email}</div>
              <div style="font-size: 13px; color: #475569; white-space: pre-wrap; margin-top: 8px; font-style: italic; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">"${message}"</div>
            </div>

            <!-- Beautiful Scanable Barcode / QR Code visual -->
            <div style="text-align: center; margin: 24px 0; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
              <p style="font-size: 12px; font-weight: bold; color: #4f46e5; margin-bottom: 8px; margin-top: 0;">Message QR Code Check</p>
              <img src="cid:messagescanqr" alt="Message QR Code" width="140" height="140" style="display: block; margin: 0 auto; outline: none; border: none; image-rendering: pixelated;" />
              <p style="font-size: 10px; color: #64748b; margin-top: 8px; margin-bottom: 0;">Scan with your device camera to view your original message details anytime.</p>
            </div>

            <div style="margin-top: 35px; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
              <div style="font-size: 13px; color: #64748b; margin-bottom: 2px;">Best regards,</div>
              <div style="font-weight: bold; color: #0f172a; font-size: 14px; margin-bottom: 2px;">
                ${process.env.SMTP_FROM_NAME || 'Gowtham S'}
              </div>
              <div style="color: #64748b; font-size: 12px; margin-bottom: 16px;">
                Security Researcher
              </div>

              <!-- Social Links -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding-right: 12px;">
                    <a href="https://www.instagram.com/gow.tham__rk" target="_blank">
                      <img src="https://img.icons8.com/color/96/instagram-new.png" width="22" height="22" alt="IG">
                    </a>
                  </td>
                  <td style="padding-right: 12px;">
                    <a href="https://x.com/hackers_00" target="_blank">
                      <img src="https://img.icons8.com/color/96/twitterx--v1.png" width="22" height="22" alt="X">
                    </a>
                  </td>
                  <td style="padding-right: 12px;">
                    <a href="https://in.linkedin.com/in/gowtham-s-528631249" target="_blank">
                      <img src="https://img.icons8.com/color/96/linkedin.png" width="22" height="22" alt="LI">
                    </a>
                  </td>
                  <td style="padding-right: 12px;">
                    <a href="https://wa.me/919346082957" target="_blank">
                      <img src="https://img.icons8.com/color/96/whatsapp.png" width="22" height="22" alt="WA">
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #eef2ff; padding: 12px; border-radius: 6px; border: 1px solid #e0e7ff; font-size: 11px; line-height: 1.5; color: #4338ca;">
                <b>Confirmation details:</b> This is an automated confirmation email to let you know your message was safely received. No further steps are needed.
              </div>

              <div style="color: #cbd5e1; font-size: 9px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 15px; text-align: center;">
                &copy; ${new Date().getFullYear()} Gowtham S | All rights reserved
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'Gowtham S'}" <${user}>`,
          to: email,
          subject: `${name}, thank you for reaching out!`,
          text: `Hello ${name},\n\nThank you for reaching out to me. I have received your message and will get back to you within 24 hours.\n\nYour message summary:\n"${message}"\n\nBest regards,\nGowtham S`,
          html: autoReplyHtml,
          attachments: [
            {
              filename: 'qrcode.png',
              content: qrBuffer,
              cid: 'messagescanqr'
            }
          ]
        });
        autoReplySent = true;

      } catch (err: any) {
        console.error("Auto-responder / notify SMTP error:", err);
        mailError = err.message || err;
      }
    } else {
      console.warn("SMTP_USER or SMTP_PASS environment variables are not configured correctly. Skipped actual email transmission.");
    }

    return res.json({ 
      success: true, 
      autoReplySent,
      notifySent,
      mailError
    });
  });

  // New API Route for 2FA Magic Link (Local Sync)
  app.post("/api/send-2fa-magic-link", async (req, res) => {
    // Basic local response, full logic is in /api/send-2fa-magic-link.ts
    res.json({ success: true, message: 'Verification link sent (Local Mock).' });
  });

  // API Route for testing SMTP connection
  app.get("/api/admin/test-smtp", async (req, res) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ 
        error: "SMTP configuration missing. Please set SMTP_USER and SMTP_PASS." 
      });
    }

    try {
      const user = (process.env.SMTP_USER || '').trim();
      const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: user,
          pass: pass,
        },
      });

      await transporter.verify();
      res.json({ success: true, message: "SMTP Server is active and ready." });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Connection failed." });
    }
  });

  // API Route for sending emails
  app.post("/api/admin/send-email", async (req, res) => {
    const { to, subject, body } = req.body;

    // Very basic security: check for a secret or admin flag if possible
    // In a real app, this should check the user's session/token
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ 
        error: "SMTP configuration missing. Please set SMTP_USER and SMTP_PASS in environment variables." 
      });
    }

    try {
      const user = (process.env.SMTP_USER || '').trim();
      const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
      console.log(`[SMTP SEND DEBUG] User: ${user.substring(0,3)}... (len:${user.length}), Pass (len:${pass.length})`);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });

      const recipients = Array.isArray(to) ? to : [to];
      
      const portalUrls = [
        'https://htwth.vercel.app/',
        'https://htwth.pages.dev/'
      ];
      
      const sendPromises = recipients.map(recipient => {
        const selectedPortalUrl = portalUrls[Math.floor(Math.random() * portalUrls.length)];
        
        const mailOptions = {
          from: `"${process.env.SMTP_FROM_NAME || 'HTWTH System'}" <${user}>`,
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
                      <a href="${process.env.APP_URL || 'https://ais-dev-fl5m6z2lmsovznnquito44-475153556207.asia-southeast1.run.app'}" style="text-decoration: none;">
                        <img src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" width="28" height="28" alt="Logo" style="display: block; border-radius: 4px;">
                      </a>
                    </td>
                    <td style="font-weight: 800; font-size: 18px; color: #0f172a; letter-spacing: -0.5px; vertical-align: middle; padding-top: 2px;">
                      <a href="${process.env.APP_URL || 'https://ais-dev-fl5m6z2lmsovznnquito44-475153556207.asia-southeast1.run.app'}" style="text-decoration: none; color: #0f172a;">
                        HTWTH
                      </a>
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
                    <a href="mailto:${user}" style="text-decoration: none; margin-right: 12px;">
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
      res.json({ success: true, message: `Successfully sent ${recipients.length} individual email(s).` });
    } catch (error: any) {
      console.error("Mail Error:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (!isProd) {
    console.log("Initializing Vite Middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const buildPath = path.join(process.cwd(), 'dist');
    console.log("BUILD PATH:", buildPath);
    app.use(express.static(buildPath));
    app.use((req, res, next) => {
      console.log("Fallback serving index.html for:", req.url);
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Vite development server integrated.`);
  });
}

startServer();
