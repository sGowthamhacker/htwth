
import React from 'react';

interface RotatingTextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const RotatingTextButton: React.FC<RotatingTextButtonProps> = ({ 
  text = "GET STARTED NOW • ", 
  onClick, 
  className = "", 
  ...props 
}) => {
  const chars = text.split('');
  const angleStep = 360 / chars.length;

  return (
    <div className={`relative inline-flex ${className}`}>
      <style>{`
        .rtb-btn {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #4f46e5; /* indigo-600 */
          color: white;
          border: none;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5);
        }
        .dark .rtb-btn {
            box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.3);
        }
        .rtb-btn:hover {
          transform: scale(1.1);
          background: #0f172a; /* slate-900 */
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5);
        }
        .dark .rtb-btn:hover {
            background: #1e293b; /* slate-800 */
        }
        
        .rtb-text-ring {
          position: absolute;
          inset: 0;
          animation: rtb-spin 10s linear infinite;
          pointer-events: none;
        }
        
        .rtb-char {
          position: absolute;
          top: 50%;
          left: 50%;
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          line-height: 1;
          will-change: transform;
          display: inline-block;
          width: 1em; /* Ensures accurate center rotation for variable width fonts */
          text-align: center;
        }

        .rtb-circle {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #4f46e5;
          z-index: 2;
          position: relative;
          overflow: hidden;
          transition: color 0.3s ease;
        }
        .rtb-btn:hover .rtb-circle {
            color: #0f172a;
        }
        .dark .rtb-btn:hover .rtb-circle {
            color: #1e293b;
        }

        .rtb-icon {
          width: 18px;
          height: 18px;
          position: absolute;
          transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .rtb-icon-default {
            transform: translate(0, 0);
        }
        .rtb-icon-hover {
            transform: translate(-150%, 150%);
        }
        
        .rtb-btn:hover .rtb-icon-default {
            transform: translate(150%, -150%);
        }
        .rtb-btn:hover .rtb-icon-hover {
            transform: translate(0, 0);
        }

        @keyframes rtb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <button className="rtb-btn group" onClick={onClick} {...props} aria-label="Get Started">
        <div className="rtb-text-ring">
          {chars.map((char, i) => (
            <span
              key={i}
              className="rtb-char"
              style={{
                // translate(-50%, -50%) centers the character element on the button's center
                // rotate(...) spins it to the correct angle
                // translateY(-34px) pushes it out to the edge (radius)
                transform: `translate(-50%, -50%) rotate(${i * angleStep}deg) translateY(-34px)`
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <div className="rtb-circle">
          <svg className="rtb-icon rtb-icon-default" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <svg className="rtb-icon rtb-icon-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default RotatingTextButton;
