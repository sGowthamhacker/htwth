
import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import QRCode from "qrcode";
import { marked } from "marked";
import { formatEmailHtml } from "./utils/emailFormatter.js";
import { GoogleGenAI, Type } from "@google/genai";

// Enforce second SMTP credentials explicitly (writeup.portal@gmail.com)
dotenv.config();
process.env.SMTP_USER = "writeup.portal@gmail.com";
process.env.SMTP_PASS = "pfxcaieddlwigvmv";
process.env.SMTP_USER2 = "writeup.portal@gmail.com";
process.env.SMTP_PASS2 = "pfxcaieddlwigvmv";
process.env.SMTP_HOST = "smtp.gmail.com";
process.env.SMTP_PORT = "465";

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
  function verifySmtpConfiguration(useSecondary = false) {
    let rawHost = 'smtp.gmail.com';
    let rawUser = 'writeup.portal@gmail.com';
    let rawPass = 'pfxcaieddlwigvmv';
    let rawPort = '465';

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

    console.log(`--- [SMTP DIAGNOSTICS ${useSecondary ? 'SECONDARY (Gmail 2)' : 'PRIMARY'}] ---`);
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
  function getSmtpTransporter(useSecondary = false) {
    const diag = verifySmtpConfiguration(useSecondary);
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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const { name, email, message } = body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields: name, email, message." });
    }

    let autoReplySent = false;
    let notifySent = false;
    let mailError: string | null = null;

    const diag = verifySmtpConfiguration();
    
    if (diag.smtpUser && diag.smtpPass) {
      try {
        const { transporter, user } = getSmtpTransporter();

        // Send polished Auto-Response to sender
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
        const appUrl = process.env.APP_URL || (hostHeader ? `${protocol}://${hostHeader}` : 'https://htwth.vercel.app/');
        const rawBodyHtml = `
          <div style="text-align: left; padding: 24px 20px; color: #1e293b; width: 100%; max-width: 100%; box-sizing: border-box; word-break: break-word; overflow-wrap: break-word;">
            <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Hello ${name},</p>
            
            <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
              Thank you for reaching out! I have received your message and will review it as soon as possible.</p>
<div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;"><p style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">MESSAGE DETAILS</p><p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"${message}"</p></div>

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
        console.error("Auto-responder SMTP error:", err);
        mailError = formatSmtpError(err);
      }
    } else {
      console.warn("SMTP_USER or SMTP_PASS environment variables are not configured correctly. Skipped actual email transmission.");
      mailError = "SMTP credentials not configured";
    }

    return res.status(200).json({ 
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
    let primaryRes = { user: 'writeup.portal@gmail.com', ok: false, error: '' };
    let secondaryRes = { user: 'ragow49@gmail.com', ok: false, error: '' };

    try {
      const { transporter, user } = getSmtpTransporter(false);
      primaryRes.user = user;
      await transporter.verify();
      primaryRes.ok = true;
    } catch (err: any) {
      primaryRes.error = err?.message || 'Primary connection failed';
    }

    try {
      const { transporter, user } = getSmtpTransporter(true);
      secondaryRes.user = user;
      await transporter.verify();
      secondaryRes.ok = true;
    } catch (err: any) {
      secondaryRes.error = err?.message || 'Secondary connection failed';
    }

    const success = primaryRes.ok || secondaryRes.ok;
    if (success) {
      return res.json({
        success: true,
        activeUser: primaryRes.ok ? primaryRes.user : secondaryRes.user,
        primary: primaryRes,
        secondary: secondaryRes,
        message: `SMTP test complete. Primary (${primaryRes.user}): ${primaryRes.ok ? 'Operational' : 'Failed'}. Secondary (${secondaryRes.user}): ${secondaryRes.ok ? 'Operational' : 'Failed'}.`
      });
    } else {
      return res.status(500).json({
        success: false,
        primary: primaryRes,
        secondary: secondaryRes,
        error: `Both SMTP connections failed. Primary: ${primaryRes.error}. Secondary: ${secondaryRes.error}`
      });
    }
  });

  // Central Server-Side Support Ticket Repository
  let SERVER_SUPPORT_TICKETS: any[] = [];

  async function sendTicketEmail(ticket: any, type: 'created' | 'reply', messageText?: string, req?: any) {
    const diag = verifySmtpConfiguration();
    if (!diag.smtpUser || !diag.smtpPass || !ticket.userEmail) return;
    try {
      const { transporter, user } = getSmtpTransporter();
      const subject = type === 'created' 
        ? `[${ticket.ticketNumber}] Support Ticket Confirmation: ${ticket.subject}`
        : `[${ticket.ticketNumber}] New Reply from Support Team`;
      
      const protocol = req?.headers?.['x-forwarded-proto'] || 'https';
      const hostHeader = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
      const appUrl = process.env.APP_URL || (hostHeader ? `${protocol}://${hostHeader}` : 'https://ais-dev-fl5m6z2lmsovznnquito44-475153556207.asia-southeast1.run.app');

      const bodyHtml = `
        <div style="text-align: left; padding: 24px 20px; color: #1e293b; width: 100%; max-width: 100%; box-sizing: border-box; word-break: break-word; overflow-wrap: break-word;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
            <span style="background: #e0e7ff; color: #4f46e5; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Ticket #${ticket.ticketNumber}</span>
            <span style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">${ticket.category || 'Support'}</span>
            <span style="background: ${ticket.status === 'Resolved' ? '#10b98120' : ticket.status === 'Closed' ? '#64748b20' : '#f59e0b20'}; color: ${ticket.status === 'Resolved' ? '#059669' : ticket.status === 'Closed' ? '#475569' : '#d97706'}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">Status: ${ticket.status || 'Open'}</span>
          </div>

          <h2 style="font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.3px;">
            ${type === 'created' ? 'Support Ticket Confirmation' : 'Support Ticket Update'}
          </h2>

          <p style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Hello ${ticket.userName || 'Valued User'},</p>
          
          <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
            ${type === 'created' 
              ? 'Thank you for reaching out to <b>HTWTH Support</b>! We have successfully received your support ticket and our team will resolve your query quickly.' 
              : 'There is a new response from our support team on your ticket:'}
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="font-size: 11px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Subject</p>
            <p style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">${ticket.subject}</p>
            ${messageText ? `<p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"${messageText}"</p>` : ''}
          </div>

          <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
            You can view, track, and reply to this ticket anytime in your platform Support & Ticket System dashboard:
          </p>

          <div style="margin: 20px 0;">
            <a href="${appUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">Open Support Dashboard</a>
          </div>
        </div>
      `;

      const formattedHtml = formatEmailHtml(bodyHtml, process.env.SMTP_FROM_NAME || 'HTWTH Support');

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'HTWTH Support'}" <${user}>`,
        to: ticket.userEmail,
        subject,
        text: `Hello ${ticket.userName || 'User'},\n\n${type === 'created' ? 'Thank you for your support ticket! We have received your query and will resolve it quickly.' : 'There is a new update on your support ticket #' + ticket.ticketNumber + '.'}\n\nTicket: #${ticket.ticketNumber} - ${ticket.subject}\n\nBest regards,\nHTWTH Support Team`,
        html: formattedHtml
      });
      console.log(`Support ticket email (${type}) sent to ${ticket.userEmail} for ticket #${ticket.ticketNumber}`);
    } catch (err) {
      console.error("Failed to send support ticket email:", err);
    }
  }

  const pruneResolvedTickets = () => {
    const now = Date.now();
    const oneHourMs = 3600000;
    SERVER_SUPPORT_TICKETS = SERVER_SUPPORT_TICKETS.filter((t: any) => {
      if (t.status === 'Resolved' || t.status === 'Closed') {
        const resolvedTime = new Date(t.updatedAt || t.createdAt || 0).getTime();
        if (now - resolvedTime > oneHourMs) return false;
      }
      return true;
    });
  };

  app.get("/api/support/tickets", (req, res) => {
    pruneResolvedTickets();
    return res.json({ tickets: SERVER_SUPPORT_TICKETS });
  });

  const processedTicketsForEmail = new Set<string>();

  app.post("/api/support/tickets", (req, res) => {
    try {
      pruneResolvedTickets();
      const { tickets, ticket, replace } = req.body;
      const existingMap = new Map<string, any>();
      SERVER_SUPPORT_TICKETS.forEach((t: any) => existingMap.set(t.id, t));

      let incomingTickets: any[] = [];
      if (replace && Array.isArray(tickets)) {
        incomingTickets = tickets;
      } else if (Array.isArray(tickets)) {
        const map = new Map<string, any>();
        existingMap.forEach((v, k) => map.set(k, v));
        tickets.forEach((t: any) => {
          const existing = map.get(t.id);
          if (!existing || new Date(t.updatedAt || t.createdAt || 0).getTime() >= new Date(existing.updatedAt || existing.createdAt || 0).getTime()) {
            map.set(t.id, t);
          }
        });
        incomingTickets = Array.from(map.values());
      } else if (ticket && ticket.id) {
        incomingTickets = [...SERVER_SUPPORT_TICKETS];
        const idx = incomingTickets.findIndex((t: any) => t.id === ticket.id);
        if (idx >= 0) {
          incomingTickets[idx] = ticket;
        } else {
          incomingTickets.unshift(ticket);
        }
      }

      // Check for new tickets or new admin replies to trigger emails
      incomingTickets.forEach((t: any) => {
        const prev = existingMap.get(t.id);
        if (!prev) {
          // Newly created ticket!
          if (!processedTicketsForEmail.has(t.id)) {
            processedTicketsForEmail.add(t.id);
            const firstMsg = Array.isArray(t.messages) && t.messages.length > 0 ? t.messages[0].message : '';
            sendTicketEmail(t, 'created', firstMsg, req);
          }
        } else {
          // Check if admin added a new message
          const prevMsgCount = Array.isArray(prev.messages) ? prev.messages.length : 0;
          const currMsgCount = Array.isArray(t.messages) ? t.messages.length : 0;
          if (currMsgCount > prevMsgCount) {
            const newMsgs = t.messages.slice(prevMsgCount);
            const realAdminMsg = newMsgs.find((m: any) => m.senderRole === 'admin' && m.senderName !== 'System Notice' && !m.message.includes("Your ticket was resolved"));
            if (realAdminMsg) {
              const replyId = t.id + '_' + realAdminMsg.id;
              if (!processedTicketsForEmail.has(replyId)) {
                processedTicketsForEmail.add(replyId);
                sendTicketEmail(t, 'reply', realAdminMsg.message, req);
              }
            }
          }
        }
      });

      SERVER_SUPPORT_TICKETS = incomingTickets.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );

      pruneResolvedTickets();
      return res.json({ success: true, tickets: SERVER_SUPPORT_TICKETS });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update tickets" });
    }
  });

  app.delete("/api/support/tickets", (req, res) => {
    try {
      const { id, ticketNumber, subject } = req.body || req.query || {};
      SERVER_SUPPORT_TICKETS = SERVER_SUPPORT_TICKETS.filter((t: any) => {
        if (id && (t.id === id || t.ticketNumber === id || t.ticketNumber === `#${id}`)) return false;
        if (ticketNumber && (t.id === ticketNumber || t.ticketNumber === ticketNumber || t.ticketNumber === `#${ticketNumber}`)) return false;
        if (subject && t.subject && t.subject.trim().toLowerCase() === subject.trim().toLowerCase()) return false;
        return true;
      });
      return res.json({ success: true, tickets: SERVER_SUPPORT_TICKETS });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to delete ticket" });
    }
  });

  app.delete("/api/support/tickets/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { ticketNumber, subject } = req.body || req.query || {};
      SERVER_SUPPORT_TICKETS = SERVER_SUPPORT_TICKETS.filter((t: any) => {
        if (t.id === id || t.ticketNumber === id || t.ticketNumber === `#${id}`) return false;
        if (ticketNumber && (t.id === ticketNumber || t.ticketNumber === ticketNumber || t.ticketNumber === `#${ticketNumber}`)) return false;
        if (subject && t.subject && t.subject.trim().toLowerCase() === subject.trim().toLowerCase()) return false;
        return true;
      });
      return res.json({ success: true, tickets: SERVER_SUPPORT_TICKETS });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to delete ticket" });
    }
  });

  // AI Backend Support Automation Route
  app.post("/api/support/process-ticket", async (req, res) => {
    try {
      const { userEmail, issueTitle, issueDescription, activeTicketsList } = req.body;

      if (!userEmail || !issueTitle) {
        return res.status(400).json({ error: "userEmail and issueTitle are required." });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "AIzaSyBujCiuNzlUvP1q561-I5TboqtCzJhZc3Y";
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const activeSMTPUser = process.env.SMTP_USER || "writeup.portal@gmail.com";

      const systemInstruction = `You are an expert Backend Support Automation AI. Your job is to process incoming support requests from a web application and format them into perfectly structured email payloads for a Nodemailer/Gmail system.

Your primary goal is to maintain distinct conversation threads for the same user based on their specific problem, ensuring separate issues do not collapse or mix together.

Follow these strict operational rules:

1. ANALYZE THE REQUEST:
- Read the incoming payload containing: userEmail, issueTitle, issueDescription, and activeTicketsList.
- Determine if the new request belongs to an existing open ticket or if it requires a brand-new conversation thread.

2. RULES FOR A NEW TICKET:
- If the user is submitting a completely new problem, assign a unique Ticket ID (e.g., #TKT-101 or #TKT-782).
- Create a specific, structured Subject Line format: "[Ticket #ID] Issue Title".
- Set the action field to "CREATE_NEW_THREAD".
- Set hiddenFingerprintTarget to null.

3. RULES FOR EXISTING TICKETS (THREAD MAINTENANCE):
- Check the activeTicketsList. If the user has an open ticket regarding the SAME issue, you must append this submission to that specific thread.
- Retain the EXACT same Subject Line from the original ticket.
- Set the action field to "APPEND_TO_THREAD".
- Retrieve the stored Hidden-Fingerprint-ID (Message-ID/References) from that active ticket and inject it into the hiddenFingerprintTarget field.

4. MASKING & SECURITY:
- Set the Friendly Display Name to '"App Support Team"' to mask the original master Gmail.

OUTPUT FORMAT:
Always reply in a strict JSON format matching this schema:
{
  "action": "CREATE_NEW_THREAD" or "APPEND_TO_THREAD",
  "ticketId": "Generated or Matched ID",
  "subject": "The Exact Subject Line",
  "friendlyFrom": "\"App Support Team\" <${activeSMTPUser}>",
  "replyTo": "${activeSMTPUser}",
  "hiddenFingerprintTarget": "Stored Message-ID string or null",
  "emailBody": "Cleanly formatted email text body"
}`;

      const userPromptPayload = JSON.stringify({
        userEmail,
        issueTitle,
        issueDescription: issueDescription || '',
        activeTicketsList: activeTicketsList || []
      });

      let aiResult: any = null;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Process this incoming support request payload and format the JSON response according to system instructions:\n${userPromptPayload}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, description: "CREATE_NEW_THREAD or APPEND_TO_THREAD" },
                ticketId: { type: Type.STRING, description: "Generated or Matched ID (e.g. #TKT-101)" },
                subject: { type: Type.STRING, description: "Structured Subject Line" },
                friendlyFrom: { type: Type.STRING, description: "Friendly display name with system email" },
                replyTo: { type: Type.STRING, description: "User reply-to email" },
                hiddenFingerprintTarget: { type: Type.STRING, description: "Stored Message-ID or null" },
                emailBody: { type: Type.STRING, description: "Formatted email body text" }
              },
              required: ["action", "ticketId", "subject", "friendlyFrom", "replyTo", "emailBody"]
            }
          }
        });

        const rawText = response.text ? response.text.trim() : '';
        if (rawText) {
          aiResult = JSON.parse(rawText);
        }
      } catch (aiErr: any) {
        console.warn("[SUPPORT AI WARNING] Gemini execution note:", aiErr?.message);
      }

      // Fallback deterministic matching engine if AI result is absent
      if (!aiResult || !aiResult.ticketId) {
        const existingMatch = (activeTicketsList || []).find((t: any) => 
          t.status !== 'Closed' &&
          t.status !== 'Resolved' &&
          (t.subject.toLowerCase().includes(issueTitle.toLowerCase()) || issueTitle.toLowerCase().includes(t.subject.toLowerCase()))
        );

        if (existingMatch) {
          aiResult = {
            action: "APPEND_TO_THREAD",
            ticketId: existingMatch.ticketNumber || existingMatch.id,
            subject: existingMatch.subject,
            friendlyFrom: `"App Support Team" <${activeSMTPUser}>`,
            replyTo: activeSMTPUser,
            hiddenFingerprintTarget: existingMatch.messageId || `<ticket-${existingMatch.id}@htwth.com>`,
            emailBody: `Dear User,\n\nWe have received your update regarding "${issueTitle}". Our support team is continuing to process this request under ticket ${existingMatch.ticketNumber}.\n\nDetails:\n${issueDescription}\n\nBest regards,\nApp Support Team`
          };
        } else {
          const randId = `#TKT-${Math.floor(100 + Math.random() * 900)}`;
          aiResult = {
            action: "CREATE_NEW_THREAD",
            ticketId: randId,
            subject: `[Ticket ${randId}] ${issueTitle}`,
            friendlyFrom: `"App Support Team" <${activeSMTPUser}>`,
            replyTo: activeSMTPUser,
            hiddenFingerprintTarget: null,
            emailBody: `Dear User,\n\nThank you for contacting support regarding "${issueTitle}". A new support ticket ${randId} has been created.\n\nDescription:\n${issueDescription}\n\nOur team will review your ticket promptly.\n\nBest regards,\nApp Support Team`
          };
        }
      }

      // Dispatch Nodemailer email via Active SMTP Transporter
      let smtpConfig = getSmtpTransporter(false);
      try {
        await smtpConfig.transporter.verify();
      } catch (err: any) {
        smtpConfig = getSmtpTransporter(true);
      }

      const generatedMsgId = `<msg-${Date.now()}-${Math.random().toString(36).substring(2,7)}@htwth.com>`;
      
      const mailOptions: any = {
        from: aiResult.friendlyFrom || `"App Support Team" <${smtpConfig.user}>`,
        to: userEmail,
        replyTo: aiResult.replyTo || smtpConfig.user || activeSMTPUser,
        subject: aiResult.subject,
        text: aiResult.emailBody,
        html: formatEmailHtml(aiResult.emailBody, "App Support Team"),
        headers: {
          'X-Ticket-ID': aiResult.ticketId,
          'X-Thread-Action': aiResult.action,
          'Message-ID': generatedMsgId
        }
      };

      if (aiResult.hiddenFingerprintTarget) {
        mailOptions.headers['In-Reply-To'] = aiResult.hiddenFingerprintTarget;
        mailOptions.headers['References'] = aiResult.hiddenFingerprintTarget;
      }

      let emailSent = false;
      let emailError = null;

      try {
        await smtpConfig.transporter.sendMail(mailOptions);
        emailSent = true;
        console.log(`[SUPPORT AI EMAIL SUCCESS] Sent support thread email for ticket ${aiResult.ticketId} to ${userEmail}`);
      } catch (mErr: any) {
        console.warn(`[SUPPORT AI EMAIL WARN] SMTP dispatch note:`, mErr?.message);
        emailError = mErr?.message;
      }

      return res.json({
        success: true,
        emailSent,
        emailError,
        generatedMessageId: generatedMsgId,
        aiPayload: aiResult
      });

    } catch (error: any) {
      console.error("[SUPPORT AI ENDPOINT ERROR]", error);
      res.status(500).json({ error: error.message || "Failed to process support request" });
    }
  });

  // API Route for sending emails
  app.post("/api/admin/send-email", async (req, res) => {
    const { to, subject, body, senderName } = req.body;

    let smtpConfig = getSmtpTransporter(false);
    try {
      await smtpConfig.transporter.verify();
    } catch (err: any) {
      console.warn("Primary SMTP verify failed, falling back to Gmail 2:", err?.message);
      smtpConfig = getSmtpTransporter(true);
    }

    try {
      const { transporter, user } = smtpConfig;
      console.log(`[SMTP SEND DEBUG] Active User: ${user.substring(0,3)}... (len:${user.length})`);

      let recipients: string[] = [];
      if (Array.isArray(to)) {
        recipients = to;
      } else if (typeof to === 'string') {
        recipients = to.split(',').map(e => e.trim()).filter(Boolean);
      } else {
        recipients = [to];
      }

      const rawSender = senderName || process.env.SENDER_NAME || process.env.SMTP_FROM_NAME;
      let actualSenderName = rawSender ? rawSender.trim() : 'HTWTH';
      if (actualSenderName === 'Gowtham S Admin' || actualSenderName === 'Gowtham S Admin System' || actualSenderName === 'System' || actualSenderName === 'admin' || !actualSenderName) {
        actualSenderName = 'HTWTH';
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
