
import dotenv from 'dotenv';
dotenv.config({ override: true });

console.log('--- DIAGNOSTIC START ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS Length:', process.env.SMTP_PASS?.length);
console.log('Current Directory:', process.cwd());
console.log('--- DIAGNOSTIC END ---');
