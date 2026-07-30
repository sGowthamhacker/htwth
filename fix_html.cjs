const fs = require('fs');

function fixHtml(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Let's replace the whole block by extracting from "Thank you for reaching out!" to "</div>" and then removing the extra trailing things.
  // Actually, let's just replace the exact messed up string with the right multiline string.

  const oldBlock = `              Thank you for reaching out! I have received your message and will review it as soon as possible.</p>
<div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;"><p style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message Details</p>
<p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"\${message}"</p>
</div>
<p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">
            </p>

            <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">`;

  const newBlock = `              Thank you for reaching out! I have received your message and will review it as soon as possible.
            </p>
            <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message Details</p>
              <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"\${message}"</p>
            </div>
            <p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">`;

  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(file, content);
}

try {
  fixHtml('server.ts');
  fixHtml('api/contact.ts');
  console.log('Fixed HTML');
} catch (e) {
  console.error(e);
}
