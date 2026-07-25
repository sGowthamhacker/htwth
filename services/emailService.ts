
import { User } from '../types';

// Declare the emailjs variable loaded from the CDN
declare var emailjs: {
    init: (publicKey: string) => void;
    send: (serviceID: string, templateID: string, templateParams: Record<string, unknown>) => Promise<any>;
};

// Use the credentials provided by the user.
// FIX: Explicitly type as string to allow comparison with a placeholder value without a type error.
const EMAILJS_PUBLIC_KEY: string = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim(); 
const EMAILJS_SERVICE_ID = (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim(); 
const EMAILJS_TEMPLATE_ID = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim(); // The ID of your "Welcome Email" template

let isInitialized = false;

/**
 * Utility function to verify and log diagnostic status of SMTP environment variables securely.
 * Masks the password except for first and last characters to identify whitespace/formatting issues.
 */
export const verifySmtpConfiguration = (config?: { host?: string; user?: string; pass?: string; port?: string | number }) => {
    const rawHost = config?.host ?? (typeof process !== 'undefined' ? process.env?.SMTP_HOST : import.meta.env?.VITE_SMTP_HOST) ?? '';
    const rawUser = config?.user ?? (typeof process !== 'undefined' ? process.env?.SMTP_USER : import.meta.env?.VITE_SMTP_USER) ?? '';
    const rawPass = config?.pass ?? (typeof process !== 'undefined' ? process.env?.SMTP_PASS : import.meta.env?.VITE_SMTP_PASS) ?? '';
    const rawPort = config?.port ?? (typeof process !== 'undefined' ? process.env?.SMTP_PORT : import.meta.env?.VITE_SMTP_PORT) ?? '';

    const smtpHost = String(rawHost).trim().replace(/^["']|["']$/g, '');
    const smtpUser = String(rawUser).trim().replace(/^["']|["']$/g, '');
    const smtpPass = String(rawPass).trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
    const smtpPort = String(rawPort).trim().replace(/^["']|["']$/g, '');

    let maskedPass = '[NOT SET]';
    if (rawPass) {
        const pStr = String(rawPass);
        const len = pStr.length;
        if (len <= 2) {
            maskedPass = '*'.repeat(len);
        } else {
            const firstChar = pStr.charAt(0);
            const lastChar = pStr.charAt(len - 1);
            maskedPass = `${firstChar}${'*'.repeat(len - 2)}${lastChar}`;
        }
    }

    const hasLeadingOrTrailingSpace = String(rawUser) !== smtpUser || String(rawHost) !== smtpHost || String(rawPass).trim() !== String(rawPass);

    console.log('--- [SMTP DIAGNOSTICS] ---');
    console.log(`SMTP_HOST: "${smtpHost}" (configured: ${Boolean(smtpHost)})`);
    console.log(`SMTP_PORT: "${smtpPort}"`);
    console.log(`SMTP_USER: "${smtpUser}" (configured: ${Boolean(smtpUser)})`);
    console.log(`SMTP_PASS: ${maskedPass} (raw length: ${String(rawPass).length}, cleaned length: ${smtpPass.length})`);
    if (hasLeadingOrTrailingSpace) {
        console.warn('[SMTP DIAGNOSTICS WARNING] Accidental leading or trailing whitespace detected in SMTP configuration. Auto-trimming applied.');
    }
    console.log('---------------------------');

    return { smtpHost, smtpUser, smtpPass, smtpPort, hasLeadingOrTrailingSpace };
};

const initializeEmailJS = () => {
    // Ensure emailjs is loaded from CDN and we have a real public key.
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && !isInitialized) {
        try {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            isInitialized = true;
            console.log('EmailJS initialized.');
        } catch (error) {
            console.error('Failed to initialize EmailJS. Check your Public Key and network access.', error);
        }
    }
};

// Call initialize on script load.
initializeEmailJS();

/**
 * Sends a welcome email to the specified user using EmailJS or SMTP auto-responder.
 * Explicitly trims all SMTP environment variables before establishing connections.
 * @param user The user object containing name and email.
 */
export const sendWelcomeEmail = async (user: User): Promise<void> => {
    console.log(`[sendWelcomeEmail] Attempting to send email to: ${user.email?.trim()}`);

    // Verify SMTP configuration diagnostics in console
    verifySmtpConfiguration();

    // Double-check initialization in case the CDN script loaded after the initial call.
    if (!isInitialized) {
        initializeEmailJS();
        if (!isInitialized) {
            console.warn('EmailJS is not initialized or configured. Skipping welcome email.');
            return;
        }
    }

    // These parameters must match the dynamic variables in your EmailJS template.
    // e.g., {{to_name}}, {{to_email}}
    const templateParams = {
        to_name: user.name?.trim() || 'User',
        to_email: user.email?.trim(),
    };

    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        console.log(`Welcome email successfully sent to ${user.email}`);
    } catch (error: any) {
        // Handle specific EmailJS "Invalid grant" error (Status 412)
        // This happens when the connected Gmail account token has expired in the EmailJS dashboard.
        if (error?.status === 412 || error?.text?.includes('Invalid grant')) {
            console.warn(
                `%c[EmailJS Error] The 'Welcome Email' failed because the Gmail connection is invalid.`,
                'color: orange; font-weight: bold;'
            );
            console.warn(`ACTION REQUIRED: Go to your EmailJS Dashboard -> Email Services -> ${EMAILJS_SERVICE_ID} -> Reconnect Account.`);
            return; // Graceful exit, do not throw
        }

        console.error(`Failed to send welcome email to ${user.email}:`, error);
        // Optionally, notify an admin or log to a monitoring service.
    }
};
