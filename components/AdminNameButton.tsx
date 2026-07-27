
import React, { useState, useEffect } from 'react';

const roleConfigs = [
  { name: 'HACKER', colorClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' },
  { name: 'DEVELOPER', colorClass: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' },
  { name: 'SECURITY', colorClass: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]' },
  { name: 'ENGINEER', colorClass: 'text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]' },
];

const AdminNameButton: React.FC = () => {
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRoleIndex((prev) => (prev + 1) % roleConfigs.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const currentRole = roleConfigs[activeRoleIndex];
  const nextRole = roleConfigs[(activeRoleIndex + 1) % roleConfigs.length];

  return (
    <div className="relative group inline-flex flex-col items-center sm:items-end font-sans my-1 select-none pt-10">
      <style>{`
        @keyframes borderShimmerMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .titan-border-shimmer {
          background: linear-gradient(
            90deg,
            #b45309 0%,
            #f59e0b 20%,
            #ffffff 45%,
            #fef08a 50%,
            #ffffff 55%,
            #f59e0b 80%,
            #b45309 100%
          );
          background-size: 200% 100%;
          animation: borderShimmerMove 2.2s linear infinite;
        }
        .titan-border-glow {
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.4));
          transition: filter 0.3s ease;
        }
        .group\/btn:hover .titan-border-glow {
          filter: drop-shadow(0 0 14px rgba(251, 191, 36, 0.85));
        }

        @keyframes roleFadeUp {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-role-fade-up {
          animation: roleFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Top Floating Speech Bubble Pill (Crystal Clear Staggered Puzzle Assembly with Perfect Responsive Alignment) */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 sm:right-0 sm:translate-x-0 z-30 pointer-events-none opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out max-w-[calc(100vw-2rem)]">
        <div className="relative inline-flex items-center px-2.5 sm:px-4.5 py-1.5 rounded-xl bg-[#080d1a] border border-slate-700/90 shadow-[0_10px_30px_rgba(0,0,0,0.85)] whitespace-nowrap">
          <div className="flex items-center gap-1 sm:gap-2.5 text-[9px] sm:text-xs font-mono font-bold tracking-[0.10em] sm:tracking-[0.18em] uppercase">
            {/* 1. HACKER - Slides from Bottom (Bright Crisp Cyan) */}
            <span className="inline-block transform translate-y-2.5 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-[50ms] text-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              HACKER
            </span>

            <span className="text-slate-500 font-semibold transition-opacity duration-300 delay-[120ms] opacity-0 group-hover:opacity-100">•</span>

            {/* 2. DEVELOPER - Slides from Top (Bright Crisp Emerald) */}
            <span className="inline-block transform -translate-y-2.5 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-[190ms] text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              DEVELOPER
            </span>

            <span className="text-slate-500 font-semibold transition-opacity duration-300 delay-[260ms] opacity-0 group-hover:opacity-100">•</span>

            {/* 3. SECURITY - Slides from Left (Bright Crisp Rose) */}
            <span className="inline-block transform -translate-x-2.5 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-[330ms] text-rose-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              SECURITY
            </span>

            <span className="text-slate-500 font-semibold transition-opacity duration-300 delay-[400ms] opacity-0 group-hover:opacity-100">•</span>

            {/* 4. ENGINEER - Slides from Right (Bright Crisp Violet) */}
            <span className="inline-block transform translate-x-2.5 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-[470ms] text-violet-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              ENGINEER
            </span>
          </div>

          {/* Speech Bubble Tail Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-10 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-700">
            <div className="absolute -top-[7px] -left-[4px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#080d1a]" />
          </div>
        </div>
      </div>

      {/* Main Row: ARCHITECTED BY + Titan Diamond Button */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Left: ARCHITECTED BY & Dynamic Fade-Up Roles */}
        <div className="flex flex-col items-end text-right">
          <span className="text-[10px] sm:text-xs font-mono font-black tracking-[0.22em] bg-gradient-to-r from-slate-200 via-slate-300 to-amber-200/80 bg-clip-text text-transparent uppercase leading-none mb-1">
            ARCHITECTED BY
          </span>
          <div className="relative h-4 overflow-hidden flex flex-col items-end">
            <span 
              key={currentRole.name} 
              className={`text-[10px] sm:text-[11px] font-mono font-extrabold tracking-widest ${currentRole.colorClass} animate-role-fade-up leading-tight`}
            >
              {currentRole.name}
            </span>
            <span className="text-[8px] font-mono tracking-widest text-slate-600/40 opacity-50 select-none -mt-1 blur-[0.2px]">
              {nextRole.name}
            </span>
          </div>
        </div>

        {/* Right: Sleek Titan Diamond Cut Button */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="relative inline-block cursor-pointer outline-none transition-all duration-300 transform hover:scale-[1.04] active:scale-95 no-underline group/btn text-left border-0 bg-transparent p-0"
        >
          {/* Outer Titan Golden Border with Chamfered Cut Corners & Shimmer Glow */}
          <div 
            className="titan-border-glow titan-border-shimmer p-[2px] relative transition-all duration-300"
            style={{
              clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)'
            }}
          >
            {/* Inner Dark Metallic Body */}
            <div 
              className="relative px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-b from-[#151c2e] via-[#0d1322] to-[#070b14] flex items-center justify-center"
              style={{
                clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)'
              }}
            >
              {/* Button Text */}
              <span className="relative z-10 font-mono font-black text-amber-100 tracking-[0.2em] text-xs sm:text-sm uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover/btn:text-white transition-colors duration-200">
                GOWTHAM S
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminNameButton;
