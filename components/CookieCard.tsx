
import React, { useState, useEffect } from 'react';

const CookieCard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
      analytics: true,
      marketing: false
  });

  useEffect(() => {
    // Ensure we check localStorage only on the client side after mount
    try {
        const hasSeenCookie = localStorage.getItem('cookie_consent_v2');
        if (!hasSeenCookie) {
          setIsVisible(true);
        }
    } catch (e) {
        // Fallback if localStorage is restricted (e.g. incognito)
        console.error("Local storage access denied", e);
    }
  }, []);

  const handleDismiss = () => {
    try {
        setIsVisible(false);
        localStorage.setItem('cookie_consent_v2', 'true');
        if (showPreferences) {
            localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
        }
    } catch (e) {
        console.error("Could not set cookie consent", e);
        setIsVisible(false); // Hide it for this session at least
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 sm:left-4 sm:right-auto z-[10010] flex justify-center sm:justify-start px-4 sm:px-0 animate-slide-up pointer-events-none">
      <style>{`
        .cookies-card {
          width: 280px;
          max-width: 100%;
          height: fit-content;
          background-color: rgb(255, 250, 250);
          border-radius: 10px;
          border: 1px solid rgb(206, 206, 206);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px;
          gap: 15px;
          position: relative;
          font-family: inherit;
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
          pointer-events: auto;
        }

        .cookie-heading {
          color: rgb(34, 34, 34);
          font-weight: 800;
          margin: 0;
          font-size: 16px;
        }
        .cookie-para {
          font-size: 12px;
          font-weight: 400;
          color: rgb(85, 85, 85);
          margin: 0;
          line-height: 1.5;
        }
        .button-wrapper {
          width: 100%;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .cookie-button {
          width: 50%;
          padding: 10px 0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: background-color 0.2s;
        }
        .accept {
          background-color: rgb(34, 34, 34);
          color: white;
        }
        .reject {
          background-color: #ececec;
          color: rgb(34, 34, 34);
        }
        .accept:hover {
          background-color: rgb(0, 0, 0);
        }
        .reject:hover {
          background-color: #ddd;
        }
        .exit-button {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .exit-button:hover {
          background-color: #f0f0f0;
        }
        .svgIconCross {
          height: 10px;
          width: 10px;
        }
        
        /* Manage Preferences Styles */
        .manage-button {
            width: 100%;
            margin-top: 0px;
            background: transparent;
            border: none;
            text-decoration: underline;
            font-size: 11px;
            color: #666;
            cursor: pointer;
            text-align: center;
        }
        .manage-button:hover {
            color: #000;
        }
        .pref-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding-bottom: 10px;
        }
        .pref-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #333;
            font-weight: 600;
        }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 34px;
            height: 18px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: rgb(34, 34, 34);
        }
        input:checked + .slider:before {
            transform: translateX(16px);
        }
        input:disabled + .slider {
            background-color: #aaa;
            opacity: 0.6;
            cursor: not-allowed;
        }
        .back-link {
            font-size: 11px;
            color: #666;
            cursor: pointer;
            text-decoration: none;
            margin-bottom: 5px;
            display: inline-block;
            font-weight: 600;
        }
        .back-link:hover {
            text-decoration: underline;
            color: #000;
        }
      `}</style>
      <div className="cookies-card">
        {showPreferences ? (
            <>
                <div className="w-full">
                    <span className="back-link" onClick={() => setShowPreferences(false)}>← Back</span>
                    <p className="cookie-heading">Preferences</p>
                </div>
                <div className="pref-container">
                    <div className="pref-row">
                        <span>Necessary</span>
                        <label className="toggle-switch">
                            <input type="checkbox" checked disabled />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="pref-row">
                        <span>Analytics</span>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={preferences.analytics} 
                                onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})} 
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="pref-row">
                        <span>Marketing</span>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={preferences.marketing} 
                                onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})} 
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
                <button className="accept cookie-button" style={{width: '100%'}} onClick={handleDismiss}>Save Preferences</button>
            </>
        ) : (
            <>
                <p className="cookie-heading">Cookie Policy</p>
                <p className="cookie-para">
                  We use cookies to improve your experience and analytics. By using our site, you consent to our use of cookies.
                </p>
                <div className="button-wrapper">
                  <button className="accept cookie-button" onClick={handleDismiss}>Accept</button>
                  <button className="reject cookie-button" onClick={handleDismiss}>Reject</button>
                </div>
                <button className="manage-button" onClick={() => setShowPreferences(true)}>Manage Preferences</button>
            </>
        )}
        <button className="exit-button" onClick={handleDismiss} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 162 162" className="svgIconCross">
            <path strokeLinecap="round" strokeWidth={17} stroke="black" d="M9.01074 8.98926L153.021 153" />
            <path strokeLinecap="round" strokeWidth={17} stroke="black" d="M9.01074 153L153.021 8.98926" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CookieCard;
