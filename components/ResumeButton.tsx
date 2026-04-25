
import React, { useState } from 'react';

interface ResumeButtonProps {
  onClick: () => void;
}

const ResumeButton: React.FC<ResumeButtonProps> = ({ onClick }) => {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === 'idle') {
      setStatus('downloading');
      // The animation sequence takes ~3.5s
      setTimeout(() => {
        setStatus('completed');
      }, 3500);
    } else if (status === 'completed') {
      onClick();
      // Reset back to idle download state after action
      setTimeout(() => {
        setStatus('idle');
      }, 1000);
    }
  };

  return (
    <div className="resume-btn-wrapper isolate scale-90 sm:scale-100 origin-center inline-block align-middle">
      <style>{`
        .resume-btn-wrapper .rb-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .resume-btn-wrapper .rb-label {
          background-color: transparent;
          border: 2px solid rgb(91, 91, 240);
          display: flex;
          align-items: center;
          /* justify-content: center; Removed to handle layout manually */
          border-radius: 50px;
          width: 140px;
          height: 48px;
          cursor: pointer;
          transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.4s ease;
          padding: 4px;
          position: relative;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          overflow: hidden;
        }
        
        .dark .resume-btn-wrapper .rb-label {
          border-color: #818cf8;
        }

        /* Hover effect only when idle */
        .resume-btn-wrapper .rb-label.idle:hover {
           background-color: rgba(91, 91, 240, 0.05);
        }
        .dark .resume-btn-wrapper .rb-label.idle:hover {
           background-color: rgba(129, 140, 248, 0.1);
        }

        /* Downloading State */
        .resume-btn-wrapper .rb-label.downloading {
          width: 48px;
          border-color: rgb(91, 91, 240);
          background-color: transparent;
        }
        .dark .resume-btn-wrapper .rb-label.downloading {
          border-color: #818cf8;
        }

        /* Completed State */
        .resume-btn-wrapper .rb-label.completed {
          width: 140px;
          border-color: rgb(35, 174, 35);
        }

        /* Circle container */
        .resume-btn-wrapper .rb-circle {
          height: 36px;
          width: 36px;
          border-radius: 50%;
          background-color: rgb(91, 91, 240);
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.4s ease;
          position: absolute;
          left: 4px; /* Fixed left position in idle */
          z-index: 10;
        }
        .dark .resume-btn-wrapper .rb-circle {
          background-color: #818cf8;
        }

        /* Progress bar inside circle */
        .resume-btn-wrapper .rb-circle::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          background-color: #3333a8;
          width: 100%;
          height: 0;
          transition: all 0.4s ease;
        }
        .dark .resume-btn-wrapper .rb-circle::before {
          background-color: #4338ca;
        }

        /* Icons */
        .resume-btn-wrapper .rb-icon {
          color: #fff;
          width: 20px;
          height: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s ease;
          z-index: 20;
        }

        .resume-btn-wrapper .rb-square {
          aspect-ratio: 1;
          width: 12px;
          border-radius: 2px;
          background-color: #fff;
          opacity: 0;
          visibility: hidden;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s ease;
          z-index: 20;
        }

        /* Text Container for centering */
        .resume-btn-wrapper .rb-text-container {
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 40px; /* 36px circle + 4px padding */
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .resume-btn-wrapper .rb-title {
          font-size: 14px;
          color: rgb(91, 91, 240);
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .dark .resume-btn-wrapper .rb-title {
          color: #818cf8;
        }

        /* --- IDLE --- */
        .resume-btn-wrapper .rb-label.idle .rb-text-container.download {
           opacity: 1;
           transform: translateY(0);
        }
        .resume-btn-wrapper .rb-label.idle .rb-text-container.open {
           opacity: 0;
           transform: translateY(10px);
           pointer-events: none;
        }

        /* --- DOWNLOADING --- */
        .resume-btn-wrapper .rb-label.downloading .rb-text-container {
          opacity: 0;
        }
        
        .resume-btn-wrapper .rb-label.downloading .rb-circle {
          left: 50%;
          transform: translateX(-50%);
        }
        
        .resume-btn-wrapper .rb-label.downloading .rb-circle::before {
          animation: installing 3s ease-in-out forwards;
        }
        .resume-btn-wrapper .rb-label.downloading .rb-icon {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
        }
        .resume-btn-wrapper .rb-label.downloading .rb-square {
          opacity: 1;
          visibility: visible;
        }

        /* --- COMPLETED --- */
        .resume-btn-wrapper .rb-label.completed .rb-circle {
           opacity: 0;
           transform: scale(0);
        }
        
        .resume-btn-wrapper .rb-label.completed .rb-text-container.download {
           opacity: 0;
           pointer-events: none;
        }
        
        .resume-btn-wrapper .rb-label.completed .rb-text-container.open {
           opacity: 1;
           transform: translateY(0);
           left: 0; /* Full width for centering 'Open' */
        }
        
        .resume-btn-wrapper .rb-label.completed .rb-title.title-open {
           color: rgb(35, 174, 35);
        }

        @keyframes installing {
          from { height: 0; }
          to { height: 100%; }
        }
      `}</style>
      <div className="rb-container">
        <div className={`rb-label ${status}`}>
          <button 
            type="button"
            className="absolute inset-0 w-full h-full cursor-pointer z-30 bg-transparent border-none p-0 m-0"
            onClick={handleClick}
            aria-label={status === 'idle' ? "Download" : status === 'completed' ? "Open" : "Downloading"}
          ></button>
          
          <span className="rb-circle">
            <svg className="rb-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17V3m0 14l-5-5m5 5l5-5" />
            </svg>
            <div className="rb-square" />
          </span>
          
          <div className="rb-text-container download">
            <span className="rb-title title-download">Download</span>
          </div>
          
          <div className="rb-text-container open">
            <span className="rb-title title-open">Open</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeButton;
