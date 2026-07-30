const fs = require('fs');
let file = 'api/contact.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `<p style="margin-top: 0; margin-bottom: 0; color: #334155; line-height: 1.6;">
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message Details</p>
          <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"\${message}"</p>
        </div>`;

content = content.replace(target, '');
fs.writeFileSync(file, content);
