const fs = require('fs');

let contact = fs.readFileSync('api/contact.ts', 'utf8');
contact = contact.replace(
  "const appUrl = APP_URL || 'https://htwth.com';",
  "const protocol = req.headers['x-forwarded-proto'] || 'https';\n    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;\n    const appUrl = APP_URL || (hostHeader ? `${protocol}://${hostHeader}` : 'https://htwth.com');"
);
fs.writeFileSync('api/contact.ts', contact);

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(
  "const appUrl = process.env.APP_URL || 'https://htwth.com';",
  "const protocol = req.headers['x-forwarded-proto'] || 'https';\n        const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;\n        const appUrl = process.env.APP_URL || (hostHeader ? `${protocol}://${hostHeader}` : 'https://htwth.com');"
);
fs.writeFileSync('server.ts', server);

console.log('Domain patching complete.');
