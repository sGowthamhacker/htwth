
import React, { useState, useEffect } from 'react';
import DownloadIcon from './icons/DownloadIcon';
import XCircleIcon from './icons/XCircleIcon';

// This interface is needed because the default Event type doesn't include PWA prompt properties.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Add Median to the window interface for TypeScript
declare global {
  interface Window {
    Median: (...args: any[]) => void;
  }
}

const InstallPWAButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Track that the PWA install prompt has been shown to the user.
      if (typeof window.Median === 'function') {
        window.Median('event', { name: 'PWA_Install_Prompt_Captured' });
      }

      // Check 5-hour timer for the popup
      const lastPromptTime = localStorage.getItem('pwa_popup_timestamp');
      const now = Date.now();
      const FIVE_HOURS = 5 * 60 * 60 * 1000;

      if (!lastPromptTime || (now - parseInt(lastPromptTime, 10) > FIVE_HOURS)) {
          setShowPopup(true);
          if (typeof window.Median === 'function') {
            window.Median('event', { name: 'PWA_Install_Popup_Shown' });
          }
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;

    // Track that the user has clicked the button to install/download.
    if (typeof window.Median === 'function') {
      window.Median('event', { name: 'PWA_Installed' });
    }

    // Open the specified URL to download the APK.
    window.open('https://median.co/share/weeezjp#apk', '_blank');

    // Reset UI state
    setInstallPrompt(null);
    setShowPopup(false);
    
    // Update timestamp to prevent popup from showing immediately again if logic resets
    localStorage.setItem('pwa_popup_timestamp', Date.now().toString());
  };

  const handleClosePopup = () => {
      setShowPopup(false);
      // Reset timer so it shows again in 5 hours
      localStorage.setItem('pwa_popup_timestamp', Date.now().toString());
  };

  if (!installPrompt) {
    return null;
  }

  // Position the button above the taskbar (56px) with a small margin.
  const bottomPosition = 'bottom-[72px]';

  return (
    <>
        {/* Persistent Floating Button */}
        <button
          onClick={handleInstallClick}
          className={`fixed ${bottomPosition} right-6 z-30 flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg rounded-full py-3 px-4 animate-slide-up hover:opacity-90 transition-opacity`}
          title="Install App"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Install App</span>
        </button>

        {/* 5-Hour Interval Popup Modal */}
        {showPopup && (
            <div className="fixed inset-0 z-[10005] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative flex flex-col items-center text-center animate-slide-up border border-white/10">
                    <button 
                        onClick={handleClosePopup}
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-transparent border-none cursor-pointer p-1"
                        aria-label="Close"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <DownloadIcon className="w-8 h-8" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Install App</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                        Install our app for a faster, fullscreen experience and offline access.
                    </p>
                    
                    <button
                        onClick={handleInstallClick}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download & Install
                    </button>
                    
                    <button 
                        onClick={handleClosePopup}
                        className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Not now, maybe later
                    </button>
                </div>
            </div>
        )}
    </>
  );
};

export default InstallPWAButton;
