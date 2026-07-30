const fs = require('fs');
let content = fs.readFileSync('api/contact.ts', 'utf8');

const importTarget = `import nodemailer from 'nodemailer';`;
const importReplace = `import nodemailer from 'nodemailer';\nimport { formatEmailHtml } from '../utils/emailFormatter.js';`;

const sendTarget = `    // 1. Send polished Auto-Response "Thank you for contacting us" to the sender
    await transporter.sendMail({
      from: \`"\${SMTP_FROM_NAME || 'Gowtham S'}" <\${smtpUser}>\`,
      to: email,
      subject: \`\${name}, thank you for reaching out!\`,
      text: \`Hello \${name},\\n\\nThank you for reaching out to me. I have received your message and will get back to you within 24 hours.\\n\\nBest regards,\\nGowtham S\`,
      html: rawBodyHtml
    });`;

const sendReplace = `    const autoReplyHtml = formatEmailHtml(rawBodyHtml, SMTP_FROM_NAME || 'Gowtham S');
    // 1. Send polished Auto-Response "Thank you for contacting us" to the sender
    await transporter.sendMail({
      from: \`"\${SMTP_FROM_NAME || 'Gowtham S'}" <\${smtpUser}>\`,
      to: email,
      subject: \`\${name}, thank you for reaching out!\`,
      text: \`Hello \${name},\\n\\nThank you for reaching out to me. I have received your message and will get back to you within 24 hours.\\n\\nBest regards,\\nGowtham S\`,
      html: autoReplyHtml
    });`;

content = content.replace(importTarget, importReplace);
content = content.replace(sendTarget, sendReplace);

fs.writeFileSync('api/contact.ts', content);
console.log("Patched api/contact.ts");
