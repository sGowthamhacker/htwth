import { marked } from 'marked';

export function formatEmailHtml(rawBody: string, senderName: string = 'Gowtham S Admin'): string {
  if (!rawBody) return '';

  // Clean senderName if it is generic like HTWTH
  let cleanSender = senderName ? senderName.trim() : 'Gowtham S Admin';
  if (cleanSender === 'HTWTH' || cleanSender === 'HTWTH System' || cleanSender === 'System' || cleanSender === 'admin' || !cleanSender) {
    cleanSender = 'Gowtham S Admin';
  }

  const trimmed = rawBody.trim();
  const isHtml = trimmed.startsWith('<div') || 
                 trimmed.startsWith('<table') || 
                 trimmed.startsWith('<!DOCTYPE') || 
                 trimmed.includes('<style') || 
                 trimmed.includes('style=') ||
                 trimmed.includes('<p') ||
                 trimmed.includes('<h1') ||
                 trimmed.includes('<h2');

  let bodyHtml = '';
  if (isHtml) {
    bodyHtml = rawBody;
  } else {
    try {
      const parsedMarkdown = marked.parse(rawBody, { breaks: true, gfm: true }) as string;
      bodyHtml = `<div style="padding: 20px 24px; color: #1e293b; font-size: 15px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${parsedMarkdown}</div>`;
    } catch {
      bodyHtml = `<div style="padding: 20px 24px; color: #1e293b; font-size: 15px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${rawBody}</div>`;
    }
  }

  // Strip leading HTML comments and whitespace to accurately test root container style
  const cleanHead = trimmed.replace(/^(\s*<!--[\s\S]*?-->\s*)*/, '');
  
  // Extract style attribute of the first HTML tag to check if the root container is explicitly dark
  let isDarkRoot = false;
  const firstTagMatch = cleanHead.match(/^<[a-z1-6]+([^>]*)/i);
  if (firstTagMatch) {
    const attributes = firstTagMatch[1];
    const styleMatch = attributes.match(/style\s*=\s*["']([^"']+)["']/i);
    if (styleMatch) {
      const styleAttr = styleMatch[1].toLowerCase();
      if (
        styleAttr.includes('#0b0f19') ||
        styleAttr.includes('#0d1117') ||
        styleAttr.includes('#111827') ||
        styleAttr.includes('#0f172a') ||
        styleAttr.includes('#1f2937') ||
        styleAttr.includes('#121212') ||
        styleAttr.includes('#1a1a1a') ||
        styleAttr.includes('#000000') ||
        styleAttr.includes('#000') ||
        styleAttr.includes('#1e1b4b')
      ) {
        isDarkRoot = true;
      }
    }
  }

  // Check if content already contains a signature/footer
  const hasFooter = rawBody.includes('Connect with') || 
                    rawBody.includes('Connect with Me') || 
                    rawBody.includes('ALL RIGHTS RESERVED') || 
                    rawBody.includes('CAUTION - ENCRYPTED') ||
                    rawBody.includes('Best regards');

  const outerBg = isDarkRoot ? '#0b0f19' : '#f8fafc';
  const cardBg = isDarkRoot ? '#111827' : '#ffffff';
  const cardBorder = isDarkRoot ? '#1e293b' : '#e2e8f0';

  // Signature block is ALWAYS white/light themed
  const sigBg = '#ffffff';
  const sigTextMuted = '#64748b';
  const sigTextHeading = '#0f172a';
  const sigSubText = '#64748b';
  const sigBorderTop = '#e2e8f0';
  const sigCardBorder = '#e2e8f0';
  const sigCautionBg = '#f8fafc';
  const sigCautionBorder = '#cbd5e1';

  if (hasFooter) {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${outerBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px 16px; width: 100%;">
        <tr>
          <td align="center" style="padding: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; width: 100%;">
              <tr>
                <td style="padding: 0;">
                  ${bodyHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `.trim();
  }

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${outerBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 16px; width: 100%;">
      <tr>
        <td align="center" style="padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            
            <!-- Message Payload -->
            <tr>
              <td style="padding: 0; background-color: ${cardBg};">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Integrated Signature Footer -->
            <tr>
              <td style="border-top: 1px solid ${sigBorderTop}; padding: 22px 24px; background-color: ${sigBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: left;">
                <div style="font-size: 13px; color: ${sigTextMuted}; margin-bottom: 4px;">Best regards,</div>
                <div style="font-weight: 800; color: ${sigTextHeading}; font-size: 15px; margin-bottom: 4px; letter-spacing: -0.2px;">${cleanSender}</div>
                <div style="color: ${sigSubText}; font-size: 12px; margin-bottom: 16px;">Security Research Hub</div>

                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                  <tr>
                    <td style="padding-right: 10px; vertical-align: middle;">
                      <img src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" width="26" height="26" alt="Logo" style="display: block; border-radius: 4px;">
                    </td>
                    <td style="font-weight: 800; font-size: 16px; color: ${sigTextHeading}; letter-spacing: -0.5px; vertical-align: middle;">
                      HTWTH
                    </td>
                  </tr>
                </table>

                <div style="border-top: 1px solid ${sigCardBorder}; padding-top: 16px; margin-top: 14px;">
                  <div style="color: ${sigSubText}; font-size: 11px; font-weight: 800; margin-bottom: 10px; letter-spacing: 0.8px; text-transform: uppercase;">
                    Connect with Me
                  </div>
                  <div style="margin-bottom: 16px;">
                    <a href="https://www.instagram.com/gow.tham__rk?utm_source=qr&igsh=NWpveGJ6eXZ0bWM3" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/instagram-new.png" width="22" height="22" alt="IG" style="vertical-align: middle;">
                    </a>
                    <a href="https://x.com/hackers_00?t=7NOXZfGHFA37-FPR-iaraA&s=09" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/twitterx--v1.png" width="22" height="22" alt="X" style="vertical-align: middle;">
                    </a>
                    <a href="https://in.linkedin.com/in/gowtham-s-528631249" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/linkedin.png" width="22" height="22" alt="LI" style="vertical-align: middle;">
                    </a>
                    <a href="https://wa.me/919346082957" style="text-decoration: none; margin-right: 12px; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/whatsapp.png" width="22" height="22" alt="WA" style="vertical-align: middle;">
                    </a>
                    <a href="mailto:gowlearner04@gmail.com" style="text-decoration: none; display: inline-block;" target="_blank">
                      <img src="https://img.icons8.com/color/96/gmail-new.png" width="22" height="22" alt="Mail" style="vertical-align: middle;">
                    </a>
                  </div>

                  <div style="background-color: ${sigCautionBg}; padding: 10px 14px; border-radius: 8px; border: 1px solid ${sigCautionBorder}; margin-bottom: 14px; font-size: 11px; line-height: 1.5; color: ${sigSubText};">
                    <b style="color: #6366f1;">CAUTION - ENCRYPTED COMMUNICATION:</b> This report contains proprietary security intelligence. Unauthorized distribution is strictly monitored.
                  </div>

                  <div style="color: ${sigSubText}; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} HackToWriteToHack | ALL RIGHTS RESERVED
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

