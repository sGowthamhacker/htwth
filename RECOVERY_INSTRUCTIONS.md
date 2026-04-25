# Supabase Recovery & Firebase Integration Guide

This guide will help you rebuild your Supabase backend and integrate it securely with your existing Firebase Authentication.

## 1. Rebuild Database Schema

1.  Log in to your Supabase Dashboard.
2.  Go to the **SQL Editor**.
3.  Click **New Query**.
4.  Copy the entire content of `supabase_setup.sql` (located in your project root) and paste it into the editor.
5.  Click **Run**.

This will:
*   Recreate all tables (`users`, `posts`, `chat_messages`, etc.) with the correct schema.
*   Enable Row Level Security (RLS) on all tables.
*   Create security policies that map Firebase UIDs to Supabase data.

## 2. Configure Environment Variables

You need to set up environment variables for the new token exchange system to work. This system securely exchanges your Firebase ID Token for a Supabase JWT, allowing RLS policies to function correctly.

### In Your Hosting Platform (Netlify / Vercel / App Platform)

Add the following environment variables:

*   `VITE_SUPABASE_URL`: Your Supabase Project URL (from Project Settings -> API).
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key (from Project Settings -> API).
*   `SUPABASE_JWT_SECRET`: Your Supabase JWT Secret.
    *   Go to **Project Settings -> API -> JWT Settings**.
    *   Copy the "JWT Secret".
*   `FIREBASE_SERVICE_ACCOUNT`: The JSON content of your Firebase Service Account Key.
    *   Go to Firebase Console -> Project Settings -> Service accounts.
    *   Click "Generate new private key".
    *   Open the downloaded JSON file.
    *   Copy the **entire content** and paste it as the value for this variable.
    *   **Note:** Ensure it is a single line string if your platform requires it, or just paste the JSON.

### Local Development (.env)

Update your local `.env` file (or create one based on `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}
```

## 3. Verify Integration

1.  Restart your development server (`npm run dev`).
2.  Log in to your application using Firebase Auth (Google/Email).
3.  Open the browser console.
4.  You should see logs indicating "Auth Sync" and potentially "Supabase setSession".
5.  Try to create a post or update your profile.
6.  If successful, the data will appear in your Supabase tables with the correct `firebase_uid`.

## How It Works

*   **Frontend**: When you log in with Firebase, the app now automatically calls a secure backend function (`/.netlify/functions/exchange-token`).
*   **Backend**: This function verifies your Firebase token and issues a custom Supabase JWT signed with your project's secret.
*   **Database**: Supabase receives this JWT. The RLS policies use the `sub` claim (which we set to your Firebase UID) to enforce security.
    *   Example Policy: `firebase_uid = (auth.jwt() ->> 'sub')`

This ensures your frontend continues to use Firebase Auth while Supabase handles data security transparently.
