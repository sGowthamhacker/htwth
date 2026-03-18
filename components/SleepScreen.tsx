
import React, { useState, useEffect } from 'react';

const SleepScreen: React.FC<{ onWake: () => void }> = ({ onWake }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      onClick={onWake}
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black opacity-90"></div>
      
      {/* Floating Particles/Stars effect could go here */}
      
      <div className="relative z-10 text-center p-8 select-none">
        <div className="mb-8 animate-pulse-slow">
            <svg className="w-24 h-24 mx-auto text-indigo-500/30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-thin text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] font-mono">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mt-4 font-light tracking-widest uppercase">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="mt-16 opacity-50 hover:opacity-100 transition-opacity duration-500">
            <p className="text-sm text-white/60 tracking-[0.3em] uppercase animate-bounce">Click to Wake</p>
        </div>
      </div>
    </div>
  );
};

export default SleepScreen;
