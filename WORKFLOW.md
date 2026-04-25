# HTWTH Application Workflow

This document outlines the architecture, development, and deployment workflows for the HTWTH web application.

## 🏗 Architecture Overview

HTWTH is a **full-stack web application** built with a modern TypeScript stack. It integrates a custom Express backend with a React frontend via Vite middleware.

### Stack
- **Frontend**: React 19, Vite 6, Tailwind CSS 4.
- **Backend**: Express 5, Node.js.
- **Authentication**: Firebase Authentication.
- **Database**: Firebase Firestore.
- **Email Service**: Nodemailer (integrated with Gmail/SMTP).
- **AI Integration**: Google Gemini API.

---

## 🛠 Development Workflow

In development, the app runs as a unified full-stack process.

1. **Server Initialization**: Running `npm run dev` executes `server.ts` using `tsx`.
2. **Vite Integration**: The Express server initializes Vite in `middlewareMode`. This provides:
   - Hot Module Replacement (HMR) for frontend assets.
   - SPA fallback handling.
   - Dynamic transpilation of TypeScript files.
3. **API Routes**: Express handles routes prefixed with `/api` (e.g., `/api/admin/send-email`) before passing control to Vite for frontend routing.

---

## 🚀 Deployment & Production Workflow

The application is optimized for production container environments.

### 1. Build Phase
- **Command**: `npm run build`
- **Output**: Generates a minimized, production-ready bundle in the `/dist` directory.

### 2. Runtime Environment
- **Command**: `npm start` (mapped to `node server.ts`).
- **Dynamic Dependency Handling**: To ensure the server doesn't crash without devDependencies, `vite` is loaded dynamically only when `NODE_ENV` is not production.
- **Static Asset Serving**: In production, Express serves the `/dist` folder directly using `express.static`.
- **SPA Fallback**: A wildcard route `app.get('*')` serves `index.html` for any non-API request, allowing React Router to handle client-side navigation.

---

## 🔐 Key Service Workflows

### Authentication Flow
1. User interacts with `AuthPage.tsx`.
2. Firebase SDK handles the handshake with Google/GitHub/Email providers.
3. Login state is synchronized via the `onAuthStateChanged` listener in `App.tsx`.

### Email Notification Flow
1. **Trigger**: An admin user interacts with the Mail tab in `AdminDashboardPage.tsx`.
2. **Request**: Frontend makes a `POST` request to `/api/admin/send-email` containing the recipient(s), subject, and content.
3. **Backend Processing**: 
   - `server.ts` validates the presence of `SMTP_USER` and `SMTP_PASS`.
   - The payload is sanitized (whitespace removal from credentials).
   - High-fidelity HTML is generated using a hardcoded template with CSS-in-HTML.
4. **Delivery**: `nodemailer` connects via Gmail/SMTP and dispatches the email.

---

## 📧 Mail System: Main Container Flow & Error Resolution

Use this section to diagnose and fix future issues with the mail functionality.

### 1. Data Flow Architecture
`UI (AdminDashboardPage)` -> `API (/api/admin/send-email)` -> `SMTP Transporter (nodemailer)` -> `Recipient Inbox`

### 2. Common Errors & Fixes
| Error Symptom | Potential Root Cause | Resolution Steps |
| :--- | :--- | :--- |
| **"SMTP configuration missing"** | Missing Env Vars in the platform settings. | Ensure `SMTP_USER` and `SMTP_PASS` are added to the Applet Secrets/Settings. |
| **"Invalid login: 535-5.7.8"** | Gmail App Password is incorrect or expired. | 1. Generate a new **App Password** from Google Account Security. <br> 2. Ensure 2FA is enabled on the sender account. |
| **"Connection timeout"** | Network restriction or firewall blocking port 465/587. | Verify if the platform allows outbound SMTP traffic. |
| **Broken Images in Email** | Referrer policy or expired Cloudinary URLs. | Check `nodemailer` template in `server.ts` for updated logo URLs. |

### 3. Verification Steps (Dry Run)
An admin can test the SMTP connection without sending an actual email using the diagnostic route:
- **Endpoint**: `GET /api/admin/test-smtp`
- **Utility**: This checks if the current credentials can successfully authenticate with the SMTP server.

### 4. Code Maintenance for Mail Template
The email design is located in `server.ts`. When updating the design:
- Use **inline CSS** only (standard for email clients).
- Always include the `process.env.APP_URL` fallback to ensure links point to the current deployment.
- Maintain the "CAUTION - ENCRYPTED COMMUNICATION" footer to keep the professional security branding.

---

### Database Interaction
- All state changes are abstracted through `/services/database.ts`, ensuring a consistent interface between the app and Firestore.
- Real-time listeners are used for notifications and shared content updates.

---

## 📝 Maintenance
- **Linting**: Run `npm run lint` to check for type safety across the entire codebase.
- **Environment Variables**: New variables must be added to `.env.example` and configured in the platform settings.
