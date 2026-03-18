
import React, { useState } from 'react';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { User } from '../types';
import LockIcon from '../components/icons/LockIcon';
import RefreshIcon from '../components/icons/RefreshIcon';

interface HabitTrackerPageProps {
    user: User;
}

const HabitTrackerPage: React.FC<HabitTrackerPageProps> = ({ user }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [iframeKey, setIframeKey] = useState(0); // Used to force reload iframe
    const isAdmin = user?.role === 'admin';

    const handleRefresh = () => {
        setIsLoading(true);
        setIframeKey(prev => prev + 1);
    };

    return (
        <div className="h-full w-full bg-white dark:bg-slate-900 flex flex-col relative overflow-hidden isolate">
            {/* Loading Overlay with smooth fade out */}
            <div 
                className={`absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-50 dark:bg-slate-900 transition-opacity duration-700 ease-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <SpinnerIcon className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">Loading Habit Report...</p>
            </div>
            
            {/* Controls Layer (Visible to everyone) */}
            <div className="absolute top-4 left-4 z-30 flex gap-2">
                <button 
                    onClick={handleRefresh}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all active:scale-95"
                    title="Reload Tracker"
                >
                    <RefreshIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Access Control for Non-Admins */}
            {!isAdmin && !isLoading && (
                <>
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-30 pointer-events-none flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/10 animate-fade-in">
                        <LockIcon className="w-3 h-3 text-amber-400" />
                        <span>View Only Mode</span>
                    </div>

                    {/* 
                       Strategic Corner Blockers:
                       These allow scrolling in the center but block specific "Action" zones.
                       Group hover effects provide visual feedback (Red tint + Lock Icon) so the user knows why it's blocked.
                    */}
                    
                    {/* 1. Block Top-Right (Settings/Edit usually here) */}
                    <div 
                        className="absolute top-0 right-0 w-24 h-20 z-20 cursor-not-allowed group flex items-start justify-end p-4 hover:bg-red-500/10 transition-colors"
                        title="Settings disabled in View Only mode"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    >
                        <LockIcon className="w-6 h-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>

                    {/* 2. Block Bottom-Right (Floating Action Button / Add Button usually here) 
                        Positioned above typical bottom nav bars (~70px up)
                    */}
                    <div 
                        className="absolute bottom-[80px] right-6 w-20 h-20 z-20 cursor-not-allowed rounded-full group flex items-center justify-center hover:bg-red-500/10 transition-colors"
                        title="Adding items disabled in View Only mode"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    >
                        <LockIcon className="w-8 h-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                </>
            )}
            
            {/* Iframe Container */}
            <iframe 
                key={iframeKey}
                src="https://habitreport.netlify.app/" 
                className={`flex-1 w-full h-full border-none block transition-opacity duration-500 transform-gpu ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                title="Habit Tracker"
                allow="clipboard-read; clipboard-write; geolocation; microphone; camera"
                style={{ 
                    colorScheme: 'normal',
                }}
            />
        </div>
    );
};

export default HabitTrackerPage;
