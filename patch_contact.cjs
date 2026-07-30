const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `    if (process.env.SMTP_USER && process.env.SMTP_PASS) {`;
const replace1 = `    const diag = verifySmtpConfiguration();\n    if (diag.smtpUser && diag.smtpPass) {`;

const target2 = `        autoReplySent = true;
      } catch (err: any) {`;
const replace2 = `        autoReplySent = true;

        // 2. Send the actual contact message to the Admin
        const notifyHtml = \`
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>New Contact Request</h2>
            <p><strong>Name:</strong> \${name}</p>
            <p><strong>Email:</strong> \${email}</p>
            <hr />
            <p style="white-space: pre-wrap;">\${message}</p>
          </div>
        \`;
        await transporter.sendMail({
          from: \`"HTWTH System" <\${user}>\`,
          replyTo: email,
          to: user, // Send to the configured SMTP_USER
          subject: \`New Contact Request from \${name}\`,
          html: notifyHtml
        });
        notifySent = true;
      } catch (err: any) {`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts");
