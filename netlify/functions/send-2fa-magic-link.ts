console.log("--- Loading send-2fa-magic-link function module ---");

import admin from 'firebase-admin';
import type { Handler, HandlerEvent } from "@netlify/functions";

// Define the shape of the user record (Mocked for now)
interface MockUser {
    id: string;
    firebase_uid: string;
    is_2fa_enabled: boolean;
    backup_codes: string[];
    email: string;
}

const BREVO_TEMPLATE_ID = 3; // As specified in your setup

// --- HELPER FUNCTIONS ---
const sendResponse = (statusCode: number, body: object) => ({
  statusCode,
  headers: { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allow requests from any origin
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
  body: JSON.stringify(body),
});

const sendError = (statusCode: number, message: string) => sendResponse(statusCode, { success: false, message });

// --- NETLIFY FUNCTION HANDLER ---
export const handler: Handler = async (event: HandlerEvent) => {
  console.log("--- 2FA Magic Link Function Invoked ---");

  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(204, {});
  }
  
  if (event.httpMethod !== 'POST') {
    return sendError(405, 'Method Not Allowed');
  }

  // --- CONFIGURATION CHECK ---
  const requiredEnvVars = [
    'BREVO_API_KEY',
    'FIREBASE_ADMIN_CONFIG',
  ];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    const errorMessage = `Configuration error: The following required environment variables are missing on the server: ${missingVars.join(', ')}. Please add them in the Netlify UI.`;
    console.error(`[FATAL] ${errorMessage}`);
    return sendError(500, errorMessage);
  }
  
  const {
    BREVO_API_KEY,
    FIREBASE_ADMIN_CONFIG,
  } = process.env;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error("[TIMEOUT] Function execution timed out internally after 9 seconds.");
    controller.abort();
  }, 9000);

  try {
    // --- ROBUST INITIALIZATION ---
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(FIREBASE_ADMIN_CONFIG!);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log("[INIT] Firebase Admin SDK initialized.");
    }

    // --- Parse Request Body ---
    const { email, backupCode } = JSON.parse(event.body || '{}');
    if (!email || !backupCode) {
      return sendError(400, 'Email and backupCode are required.');
    }

    // --- Fetch User from Firebase Admin (Replacement for Supabase) ---
    console.log(`[DB] Fetching user from Firebase: ${email}`);
    let firebaseUser;
    try {
        firebaseUser = await admin.auth().getUserByEmail(email);
    } catch (error) {
        console.error("Error fetching user from Firebase:", error);
        return sendError(404, 'User not found.');
    }

    console.log(`[DB] Found user: ${firebaseUser.uid}`);

    // --- MOCK Verify 2FA Status and Code ---
    // Since we removed Supabase, we don't have the 2FA status or backup codes.
    // We will assume 2FA is enabled and the code is valid for this placeholder implementation.
    // In a real implementation, you would store this in Firestore or another DB.
    console.log('[DB] Mocking backup code validation. Accepting any code.');

    // --- Generate Firebase Custom Token ---
    console.log(`[FIREBASE] Generating custom token for UID: ${firebaseUser.uid}`);
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
    console.log("[FIREBASE] Token generated.");

    // --- Send Email via Brevo ---
    // Hardcode the correct app URL to fix magic link domain issue.
    const CORRECT_APP_URL = 'https://writeupportalos.netlify.app';
    const magicLink = `${CORRECT_APP_URL}/#/auth/verify-link?token=${customToken}`;
    const brevoPayload = {
      to: [{ email: firebaseUser.email }],
      templateId: BREVO_TEMPLATE_ID,
      params: { magic_link: magicLink },
    };

    console.log("[BREVO] Sending email via API...");
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify(brevoPayload),
      signal: controller.signal,
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      console.error(`[BREVO] API error (${brevoResponse.status}):`, errorBody);
      throw new Error('Failed to send login email.');
    }
    
    console.log(`[BREVO] Successfully queued email to ${firebaseUser.email}`);
    
    // --- Success ---
    console.log("--- Function execution completed successfully. ---");
    return sendResponse(200, { success: true, message: 'Verification link sent.' });

  } catch (error: any) {
    // --- Top-level Error Handler ---
    if (error.name === 'AbortError') {
      console.error("[ABORT] Operation aborted due to internal timeout.");
      return sendError(504, 'The server took too long to respond. Please try again.');
    }
    console.error('[FATAL] Unhandled error in function handler:', error.message);
    return sendError(500, error.message || 'An internal server error occurred.');
  } finally {
    clearTimeout(timeoutId);
  }
};