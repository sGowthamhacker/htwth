
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

        // 1. Send polished Auto-Response "Thank you for contacting us" to the sender
        const appUrl = process.env.APP_URL || 'https://htwth.com';
        const rawBodyHtml = `
          <div style="text-align: left; padding: 24px 20px; color: #1e293b; width: 100%; max-width: 100%; box-sizing: border-box; word-break: break-word; overflow-wrap: break-word;">
            <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Hello ${name},</p>
            
            <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
              Thank you for reaching out! I have received your message and will review it as soon as possible.
            </p>

            <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">
              Check out our website for updates:<br/>
              <a href="${appUrl}" style="color: #6366f1; font-weight: 600; text-decoration: none; word-break: break-all; overflow-wrap: anywhere; display: inline-block; max-width: 100%; margin-top: 4px;">${appUrl}</a>
            </p>
          </div>
        `;

        const autoReplyHtml = formatEmailHtml(rawBodyHtml, process.env.SMTP_FROM_NAME || 'Gowtham S');


        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'Gowtham S'}" <${user}>`,
          to: email,
          subject: `${name}, thank you for reaching out!`,
          text: `Hello ${name},\n\nThank you for reaching out to me. I have received your message and will get back to you within 24 hours.\n\nBest regards,\nGowtham S`,
          html: autoReplyHtml
        });
        autoReplySent = true;

      } catch (err: any) {
        console.error("Auto-responder / notify SMTP error:", err);
        mailError = formatSmtpError(err);
        return res.status(500).json({ 
          success: false, 
          error: "Email system is currently offline or experiencing issues. Please try again later.",
          mailError 
        });
      }
    } else {
      console.warn("SMTP_USER or SMTP_PASS environment variables are not configured correctly. Skipped actual email transmission.");
      return res.status(500).json({ 
        success: false, 
        error: "Email system is not configured." 
      });
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
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { port: 24679 }
      },
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
