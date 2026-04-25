import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

const BREVO_TEMPLATE_ID = 3;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { BREVO_API_KEY, FIREBASE_ADMIN_CONFIG, APP_URL } = process.env;

  if (!BREVO_API_KEY || !FIREBASE_ADMIN_CONFIG) {
    return res.status(500).json({ 
        success: false, 
        message: `Configuration error: Missing BREVO_API_KEY or FIREBASE_ADMIN_CONFIG.` 
    });
  }

  try {
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(FIREBASE_ADMIN_CONFIG);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }

    const { email, backupCode } = req.body;
    if (!email || !backupCode) {
      return res.status(400).json({ success: false, message: 'Email and backupCode are required.' });
    }

    let firebaseUser;
    try {
        firebaseUser = await admin.auth().getUserByEmail(email);
    } catch (error) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

    const baseUrl = (APP_URL || '').replace(/\/$/, '');
    const magicLink = `${baseUrl}/#/auth/verify-link?token=${customToken}`;
    
    const brevoPayload = {
      to: [{ email: firebaseUser.email }],
      templateId: BREVO_TEMPLATE_ID,
      params: { magic_link: magicLink },
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(brevoPayload),
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      throw new Error(`Failed to send login email: ${errorBody}`);
    }
    
    return res.status(200).json({ success: true, message: 'Verification link sent.' });

  } catch (error: any) {
    console.error('[FATAL] Unhandled error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'An internal server error occurred.' });
  }
}
