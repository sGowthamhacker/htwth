
import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import QRCode from "qrcode";
import { marked } from "marked";
import { formatEmailHtml } from "./utils/emailFormatter.js";

// Load .env for local dev without overwriting existing non-empty system process.env variables
const sysSmtpUser = process.env.SMTP_USER;
const sysSmtpPass = process.env.SMTP_PASS;
const sysSmtpHost = process.env.SMTP_HOST;
const sysSmtpPort = process.env.SMTP_PORT;
dotenv.config();
if (sysSmtpUser && sysSmtpUser.trim()) process.env.SMTP_USER = sysSmtpUser;
if (sysSmtpPass && sysSmtpPass.trim()) process.env.SMTP_PASS = sysSmtpPass;
if (sysSmtpHost && sysSmtpHost.trim()) process.env.SMTP_HOST = sysSmtpHost;
if (sysSmtpPort && sysSmtpPort.trim()) process.env.SMTP_PORT = sysSmtpPort;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add Health Check Endpoint for container health probes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

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

  // Utility function to verify and log diagnostic status of SMTP configuration
  function verifySmtpConfiguration() {
    const rawHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const rawUser = process.env.SMTP_USER || 'ragow49@gmail.com';
    const rawPass = process.env.SMTP_PASS || 'clfuqmldpuezhslv';
    const rawPort = process.env.SMTP_PORT || '465';

    const smtpHost = rawHost.trim().replace(/^["']|["']$/g, '');
    const smtpUser = rawUser.trim().replace(/^["']|["']$/g, '');
    const smtpPass = rawPass.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
    const smtpPort = rawPort.trim().replace(/^["']|["']$/g, '');

    let maskedPass = '[NOT SET]';
    if (rawPass) {
      const pStr = String(rawPass);
      const len = pStr.length;
      if (len <= 2) {
        maskedPass = '*'.repeat(len);
      } else {
        const firstChar = pStr.charAt(0);
        const lastChar = pStr.charAt(len - 1);
        maskedPass = `${firstChar}${'*'.repeat(len - 2)}${lastChar}`;
      }
    }

    const hasWhitespaceIssue = rawUser !== smtpUser || rawHost !== smtpHost || rawPass.trim() !== rawPass;

    console.log('--- [SMTP DIAGNOSTICS] ---');
    console.log(`SMTP_HOST: "${smtpHost}" (configured: ${Boolean(smtpHost)})`);
    console.log(`SMTP_PORT: "${smtpPort}"`);
    console.log(`SMTP_USER: "${smtpUser}" (configured: ${Boolean(smtpUser)})`);
    console.log(`SMTP_PASS: ${maskedPass} (raw len: ${rawPass.length}, cleaned len: ${smtpPass.length})`);
    if (hasWhitespaceIssue) {
      console.warn('[SMTP WARNING] Leading/trailing whitespace detected in SMTP configuration. Auto-trimming applied.');
    }
    console.log('---------------------------');

    return { smtpHost, smtpUser, smtpPass, smtpPort, hasWhitespaceIssue };
  }

  // Helper to construct clean SMTP Transporter
  function getSmtpTransporter() {
    const diag = verifySmtpConfiguration();
    const user = diag.smtpUser;
    const pass = diag.smtpPass;
    const host = diag.smtpHost;
    const portStr = diag.smtpPort;
    const port = portStr ? parseInt(portStr, 10) : undefined;

    let transportConfig: any;
    if (host) {
      transportConfig = {
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      };
    } else {
      transportConfig = {
        service: "gmail",
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      };
    }

    return {
      transporter: nodemailer.createTransport(transportConfig),
      user,
      pass
    };
  }

  function formatSmtpError(error: any): string {
    const msg = error?.message || String(error);
    if (msg.includes("535") || msg.includes("BadCredentials") || msg.includes("Username and Password not accepted")) {
      return `SMTP Auth Failed (535 Bad Credentials).\n` +
             `To fix this Google Gmail SMTP issue:\n` +
             `1. Ensure 2-Step Verification (2FA) is turned ON for ${process.env.SMTP_USER || 'your Google Account'}.\n` +
             `2. Visit https://myaccount.google.com/apppasswords to create a 16-character App Password.\n` +
             `3. Set SMTP_PASS in Settings -> Secrets to this 16-character App Password.\n` +
             `Details: ${msg}`;
    }
    return msg;
  }

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
        const { transporter, user } = getSmtpTransporter();

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
        mailError = formatSmtpError(err);
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
        error: "SMTP configuration missing. Please set SMTP_USER and SMTP_PASS in environment variables." 
      });
    }

    try {
      const { transporter } = getSmtpTransporter();
      await transporter.verify();
      res.json({ success: true, message: "SMTP Server is active and ready." });
    } catch (error: any) {
      res.status(500).json({ error: formatSmtpError(error) });
    }
  });

  // API Route for sending emails
  app.post("/api/admin/send-email", async (req, res) => {
    const { to, subject, body, senderName } = req.body;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ 
        error: "SMTP configuration missing. Please set SMTP_USER and SMTP_PASS in environment variables." 
      });
    }

    try {
      const { transporter, user } = getSmtpTransporter();
      console.log(`[SMTP SEND DEBUG] User: ${user.substring(0,3)}... (len:${user.length})`);

      const recipients = Array.isArray(to) ? to : [to];
      const results = [];

      const rawSender = senderName || process.env.SENDER_NAME || process.env.SMTP_FROM_NAME;
      let actualSenderName = rawSender ? rawSender.trim() : 'Gowtham S Admin';
      if (actualSenderName === 'HTWTH' || actualSenderName === 'HTWTH System' || actualSenderName === 'System' || actualSenderName === 'admin' || !actualSenderName) {
        actualSenderName = 'Gowtham S Admin';
      }
      const htmlFormattedContent = formatEmailHtml(body || '', actualSenderName);

      // Return immediately for multiple recipients to avoid UI timeout
      if (recipients.length > 1) {
        res.json({ success: true, message: `Email sending process started for ${recipients.length} recipient(s) in the background.` });
        
        // Background process
        (async () => {
          let fulfilled = 0;
          let rejected = 0;
          for (const recipient of recipients) {
            const mailOptions = {
              from: `"${process.env.SMTP_FROM_NAME || 'HTWTH System'}" <${user}>`,
              to: recipient,
              subject: subject,
              text: body,
              html: htmlFormattedContent
            };
            
            try {
              await transporter.sendMail(mailOptions);
              fulfilled++;
              await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
              console.error(`[SMTP ERROR] Failed to send email to ${recipient}:`, err);
              rejected++;
            }
          }
          console.log(`[SMTP BACKGROUND] Sent to ${fulfilled} recipient(s). Failed: ${rejected}`);
        })();
      } else {
        // Single recipient: wait and return actual result
        const recipient = recipients[0];
        const mailOptions = {
          from: `"${process.env.SMTP_FROM_NAME || 'HTWTH System'}" <${user}>`,
          to: recipient,
          subject: subject,
          text: body,
          html: htmlFormattedContent
        };
        
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: `Successfully sent to 1 recipient.` });
      }
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
    
    app.use((req, res, next) => {
      console.log("[DEV-MISSING] ", req.url);
      next();
    });
  } else {
    console.log("Serving static production assets from /dist...");
    const buildPath = path.join(process.cwd(), 'dist');
    console.log("BUILD PATH:", buildPath);
    app.use(express.static(buildPath));
    app.get('*all', (req, res) => {
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
