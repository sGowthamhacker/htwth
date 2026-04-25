
import { User } from '../types';

// Declare the emailjs variable loaded from the CDN
declare var emailjs: {
    init: (publicKey: string) => void;
    send: (serviceID: string, templateID: string, templateParams: Record<string, unknown>) => Promise<any>;
};

// Use the credentials provided by the user.
// FIX: Explicitly type as string to allow comparison with a placeholder value without a type error.
const EMAILJS_PUBLIC_KEY: string = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''; 
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''; 
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''; // The ID of your "Welcome Email" template

let isInitialized = false;

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
 * Sends a welcome email to the specified user using EmailJS.
 * This is a fire-and-forget function. It will not block the UI thread.
 * @param user The user object containing name and email.
 */
export const sendWelcomeEmail = async (user: User): Promise<void> => {
    console.log(`[sendWelcomeEmail] Attempting to send email to: ${user.email}`);
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
        to_name: user.name,
        to_email: user.email,
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
