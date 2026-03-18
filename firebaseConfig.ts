// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Temporarily disabled due to load errors

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBVlOhHgVqBefjb-XKBX6RP39j--jr-0uI",
  authDomain: "bug-portal-htwth.firebaseapp.com",
  projectId: "bug-portal-htwth",
  storageBucket: "bug-portal-htwth.firebasestorage.app",
  messagingSenderId: "219136546989",
  appId: "1:219136546989:web:e43c0bf77f7b08132b8e24",
  measurementId: "G-V7PJ97LWJ8"
};


// Initialize Firebase as a singleton to prevent re-initialization errors.
// This works in conjunction with the inline script in index.html.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics
// Check if window is defined (browser environment) before initializing analytics
let analytics;
if (typeof window !== 'undefined') {
  // analytics = getAnalytics(app); // Temporarily disabled
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Expose to window for console debugging.
// This is the crucial step that allows the user's debug script to find the auth instance
// after this module is executed by the import in index.tsx.
(window as any).firebaseApp = app;
(window as any).firebaseAuth = auth;


// Export providers for social login
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();