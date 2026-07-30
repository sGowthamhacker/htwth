const fs = require('fs');

const replacement = `            <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
              Thank you for reaching out! I have received your message and will review it as soon as possible.
            </p>
            <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message Details</p>
              <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"\${message}"</p>
            </div>
            <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">`;

const target1 = `            <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
              Thank you for reaching out! I have received your message and will review it as soon as possible.
            </p>
            <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">`;

const target2 = `        <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
          Thank you for reaching out! I have received your message and will review it as soon as possible.
        </p>
        <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">`;

const replacement2 = `        <p style="margin-top: 0; margin-bottom: 16px; color: #334155; line-height: 1.6;">
          Thank you for reaching out! I have received your message and will review it as soon as possible.
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message Details</p>
          <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"\${message}"</p>
        </div>
        <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">`;

try {
  let server = fs.readFileSync('server.ts', 'utf8');
  server = server.replace(target1, replacement);
  fs.writeFileSync('server.ts', server);

  let contact = fs.readFileSync('api/contact.ts', 'utf8');
  contact = contact.replace(target2, replacement2);
  fs.writeFileSync('api/contact.ts', contact);
  console.log('Patched msg details');
} catch (e) {
  console.error(e);
}
