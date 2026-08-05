import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

function formatEmailHtml(rawBody: string, senderName: string = 'HTWTH Support'): string {
  const outerBg = '#f8fafc';
  const cardBg = '#ffffff';
  const cardBorder = '#e2e8f0';
  const sigBg = '#ffffff';
  const sigTextMuted = '#64748b';
  const sigTextHeading = '#0f172a';
  const sigSubText = '#64748b';
  const sigBorderTop = '#e2e8f0';
  const sigCardBorder = '#e2e8f0';
  const sigCautionBg = '#f8fafc';
  const sigCautionBorder = '#cbd5e1';

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${outerBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 10px; width: 100%; table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); word-break: break-word; overflow-wrap: break-word; table-layout: fixed;">
            
            <!-- Message Payload -->
            <tr>
              <td style="padding: 0; background-color: ${cardBg}; word-break: break-word; overflow-wrap: break-word;">
                ${rawBody}
              </td>
            </tr>

            <!-- Integrated Signature Footer -->
            <tr>
              <td style="border-top: 1px solid ${sigBorderTop}; padding: 22px 20px; background-color: ${sigBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: left;">
                <div style="font-size: 13px; color: ${sigTextMuted}; margin-bottom: 4px;">Best regards,</div>
                <div style="font-weight: 800; color: ${sigTextHeading}; font-size: 15px; margin-bottom: 4px; letter-spacing: -0.2px;">${senderName} Team</div>
                <div style="color: ${sigSubText}; font-size: 12px; margin-bottom: 16px;">Security Research Hub</div>

                <div style="border-top: 1px solid ${sigCardBorder}; padding-top: 16px; margin-top: 14px;">
                  <div style="background-color: ${sigCautionBg}; padding: 10px 14px; border-radius: 8px; border: 1px solid ${sigCautionBorder}; margin-bottom: 14px; font-size: 11px; line-height: 1.5; color: ${sigSubText};">
                    <b style="color: #6366f1;">CAUTION - ENCRYPTED COMMUNICATION:</b> This report contains proprietary security intelligence. Unauthorized distribution is strictly monitored.
                  </div>
                  <div style="color: ${sigSubText}; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} HTWTH | ALL RIGHTS RESERVED
                  </div>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  `.trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json({ tickets: [] }); // Stub for Vercel
  }

  if (req.method === 'POST') {
    const { newEventPayload } = req.body;
    
    // Only send email if a specific new event payload was provided
    if (newEventPayload && newEventPayload.ticket && newEventPayload.type) {
      const { type, ticket, message } = newEventPayload;
      
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (!smtpUser || !smtpPass) {
        console.warn('SMTP credentials not configured. Skipping email.');
        return res.json({ success: true, warning: 'SMTP not configured' });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass }
        });

        const subject = type === 'created' 
          ? `[${ticket.ticketNumber}] Support Ticket Confirmation: ${ticket.subject}`
          : `[${ticket.ticketNumber}] New Reply from Support Team`;
              
        const appUrl = process.env.APP_URL || 'https://ais-dev-fl5m6z2lmsovznnquito44-475153556207.asia-southeast1.run.app';
        
        const messageText = message || (ticket.messages && ticket.messages.length > 0 ? ticket.messages[0].message : '');

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

        // Note: For replies we ONLY want to email if the sender was admin
        // But for safety in Vercel we'll just send if there is an event payload.
        // If they want to get an email, we send it.
        // Ideally frontend shouldn't send 'reply' events if they're the ones replying, unless it's a notification to admin.
        
        // Let's send the email to the user
        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'HTWTH Support'}" <${smtpUser}>`,
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
    
    return res.json({ success: true, message: 'Processed via Vercel Edge' });
  }

  if (req.method === 'DELETE') {
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
