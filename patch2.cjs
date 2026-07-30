const fs = require('fs');
let content = fs.readFileSync('api/contact.ts', 'utf8');

const notifyHtmlOld = `    const notifyHtml = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> \${name}</p>
        <p><strong>Email:</strong> \${email}</p>
        <hr />
        <p style="white-space: pre-wrap;">\${message}</p>
      </div>
    \`;`;

const notifyHtmlNew = `    const notifyHtmlRaw = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> \${name}</p>
        <p><strong>Email:</strong> \${email}</p>
        <hr />
        <p style="white-space: pre-wrap;">\${message}</p>
      </div>
    \`;
    const notifyHtml = formatEmailHtml(notifyHtmlRaw, 'HTWTH System');`;

content = content.replace(notifyHtmlOld, notifyHtmlNew);
fs.writeFileSync('api/contact.ts', content);
