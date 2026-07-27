const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Remove Message Details block
content = content.replace(
  /<div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; box-sizing: border-box;">\s*<div style="font-size: 11px; font-weight: 800; color: #4f46e5; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Message Details<\/div>\s*<div style="font-size: 13px; color: #475569; white-space: pre-wrap; font-style: italic; word-break: break-word; overflow-wrap: break-word;">"\$\{message\}"<\/div>\s*<\/div>\s*/g,
  ''
);

// 2. Remove Your message summary from text
content = content.replace(
  /\\n\\nYour message summary:\\n"\$\{message\}"/g,
  ''
);

// 3. Remove admin email notification
content = content.replace(
  /\s*\/\/\ 2\.\ Notify the Admin[\s\S]*?notifySent = true;\s*\}/g,
  ''
);

fs.writeFileSync('server.ts', content, 'utf8');
