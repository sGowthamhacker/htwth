import './polyfills';
import './src/scripts/marked-config.js';
import './src/scripts/tailwind-config.js';
// import './src/scripts/median-config.js'; // Disabled due to 404
import { auth } from './firebaseConfig';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimeProvider } from './contexts/TimeContext';
import { signInWithCustomToken, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import './src/i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// UNREGISTER Service Worker to clear bad cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('ServiceWorker unregistered');
    }
  });
}

const renderApp = () => {
  let root = (window as any)._reactRoot;
  if (!root) {
    root = ReactDOM.createRoot(rootElement);
    (window as any)._reactRoot = root;
  }
  
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <TimeProvider>
          <App />
        </TimeProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const handleAuthAndLoadApp = async () => {
  const hash = window.location.hash;
  const currentUrl = window.location.href;

  rootElement.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background-color:#0f172a; color:white; text-align: center; padding: 1rem;">
      <p>🔐 Verifying your secure login link...</p>
    </div>
  `;

  // --- Flow 1: Custom Token from 2FA ---
  if (hash.startsWith("#/auth/verify-link")) {
      console.log("🔑 2FA Magic link detected.");
      try {
          const params = new URLSearchParams(hash.split("?")[1]);
          const token = params.get("token");

          if (token) {
              await signInWithCustomToken(auth, token);
              sessionStorage.setItem('isNewLogin', 'true');
              console.log("✅ 2FA login successful. Setting hash to home.");
              window.location.hash = '#/home';
          } else {
              console.warn("⚠️ Path is for verify-link, but no token found.");
              window.location.hash = "/#/auth";
          }
      } catch (err) {
          console.error("❌ 2FA magic link error:", err);
          alert("2FA login link failed or expired. Please try again.");
          window.location.hash = "/#/auth";
      }
  }
  // --- Flow 2: Standard Firebase Email Link ---
  else if (isSignInWithEmailLink(auth, currentUrl)) {
      console.log("🔑 Firebase Email link detected.");
      let email = window.localStorage.getItem("magic_email");
      if (!email) {
          email = window.prompt("Please provide your email for confirmation");
      }

      if (email) {
          try {
              await signInWithEmailLink(auth, email, currentUrl);
              window.localStorage.removeItem("magic_email");
              sessionStorage.setItem('isNewLogin', 'true');
              console.log("✅ Firebase Email link login successful. Setting hash to home.");
              window.location.hash = '#/home';
          } catch (err) {
              console.error("❌ Firebase Email link error:", err);
              alert("Login failed. The link may be invalid or expired. Please request a new one.");
              window.location.hash = "/#/auth";
          }
      } else {
          alert("Could not complete login: email is missing.");
          window.location.hash = "/#/auth";
      }
  }
  
  // Clear the loading message before rendering the app
  rootElement.innerHTML = '';
  renderApp();
};

const isAuthRoute = window.location.hash.startsWith("#/auth/verify-link") || isSignInWithEmailLink(auth, window.location.href);

if (isAuthRoute) {
    handleAuthAndLoadApp();
} else {
    renderApp();
}