
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
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
