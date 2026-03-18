
import React, { useId } from 'react';

interface RetroSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  width?: string;
  className?: string;
}

const RetroSearchInput: React.FC<RetroSearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  onKeyDown,
  width = "100%",
  className = ""
}) => {
  const uniqueId = useId().replace(/:/g, '');

  return (
    <div className={`retro-search-wrapper ${className}`} style={{ '--input-width': width, '--input-height': '36px' } as React.CSSProperties}>
      <style>{`
        .retro-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: var(--input-width);
          height: var(--input-height);
          min-width: 0; /* Allow shrinking */
          font-family: var(--font-sans, 'Inter', sans-serif);
          isolation: isolate;
        }

        /* --- Animated Background Layers --- */
        .retro-glow,
        .retro-border-rotate {
          position: absolute;
          inset: -1.5px; /* Extend slightly beyond container */
          border-radius: 9px; 
          overflow: hidden;
          z-index: 0;
          opacity: 0; /* Hidden by default */
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        /* The blurred glow effect */
        .retro-glow {
          filter: blur(10px);
          z-index: -1;
        }
        
        /* The sharp rotating border effect */
        .retro-border-rotate {
          filter: blur(0.5px); /* Very slight blur to smooth gradients */
          z-index: 0;
        }

        /* Show effects on hover/focus */
        .retro-search-wrapper:hover .retro-glow,
        .retro-search-wrapper:focus-within .retro-glow,
        .retro-search-wrapper:hover .retro-border-rotate,
        .retro-search-wrapper:focus-within .retro-border-rotate {
          opacity: 1;
        }
        
        /* --- Inner Solid Background (The container) --- */
        .retro-inner-bg {
          position: absolute;
          inset: 0; 
          background-color: #ffffff; /* White for Light Mode visibility */
          border: 1px solid #cbd5e1; /* Slate-300: Static border when idle */
          border-radius: 8px;
          z-index: 1;
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        /* When active/hover, make inner slightly smaller to show the animated border */
        .retro-search-wrapper:hover .retro-inner-bg,
        .retro-search-wrapper:focus-within .retro-inner-bg {
           border-color: transparent; 
           inset: 1px;
           background-color: #ffffff;
        }

        .dark .retro-inner-bg {
          background-color: #1e293b; /* Slate-800 */
          border-color: #334155; /* Slate-700 */
          box-shadow: none;
        }
        
        .dark .retro-search-wrapper:hover .retro-inner-bg,
        .dark .retro-search-wrapper:focus-within .retro-inner-bg {
           background-color: #0f172a; /* Slate-900 on focus */
           border-color: transparent;
        }

        /* --- Input Field --- */
        .retro-input {
          position: relative;
          z-index: 2;
          background: transparent;
          color: #1e293b; /* Slate-800 */
          border: none;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          padding-left: 34px; /* Space for icon */
          padding-right: 12px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          display: block;
        }
        
        .dark .retro-input {
            color: #f1f5f9; /* Slate-100 */
        }
        
        .retro-input:focus {
          outline: none;
        }

        .retro-input::placeholder {
          color: #64748b; /* Slate-500: Darker for better visibility */
          opacity: 1;
        }
        .dark .retro-input::placeholder {
          color: #64748b; /* Slate-500 */
        }

        /* --- Icon --- */
        .retro-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          pointer-events: none;
          opacity: 0.6;
          color: #475569; /* Slate-600 */
          transition: all 0.3s ease;
          display: flex;
        }
        
        .dark .retro-search-icon {
            color: #94a3b8; /* Slate-400 */
        }
        
        .retro-search-wrapper:focus-within .retro-search-icon {
            opacity: 1;
            color: #6366f1; /* Indigo-500 */
        }
        .dark .retro-search-wrapper:focus-within .retro-search-icon {
            color: #818cf8; /* Indigo-400 */
        }

        /* --- Animation Logic --- */
        @keyframes retro-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* The rotating gradient layer */
        .retro-gradient-layer {
          content: "";
          position: absolute;
          top: 50%; left: 50%;
          width: 200%; height: 400%; /* Large enough to cover rotation */
          transform: translate(-50%, -50%);
          background: conic-gradient(
            transparent 0deg,
            transparent 80deg,
            #818cf8 100deg, /* Indigo-400 */
            #c084fc 140deg, /* Violet-400 */
            transparent 180deg,
            transparent 260deg,
            #22d3ee 280deg, /* Cyan-400 */
            #818cf8 320deg,
            transparent 360deg
          );
          animation: retro-spin 4s linear infinite;
          animation-play-state: paused;
        }

        /* Run animation on hover/focus */
        .retro-search-wrapper:hover .retro-gradient-layer,
        .retro-search-wrapper:focus-within .retro-gradient-layer {
          animation-play-state: running;
        }
      `}</style>
      
      {/* Animated Layers (Hidden by default, show on hover/focus via CSS) */}
      <div className="retro-glow">
         <div className="retro-gradient-layer" />
      </div>
      <div className="retro-border-rotate">
         <div className="retro-gradient-layer" />
      </div>
      
      {/* Inner Background (Solid box that holds the input) */}
      <div className="retro-inner-bg" />

      {/* Input and Icon */}
      <input 
        className="retro-input" 
        name="text" 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="retro-search-icon">
        <svg fill="none" height={15} width={15} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx={11} cy={11} r={8} />
          <line x1={21} x2="16.65" y1={21} y2="16.65" />
        </svg>
      </div>
    </div>
  );
}

export default RetroSearchInput;
