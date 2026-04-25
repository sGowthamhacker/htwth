
import React from 'react';

interface AnimatedHeartCheckboxProps {
  checked: boolean;
  onChange: () => void;
  id: string;
  className?: string;
}

const AnimatedHeartCheckbox: React.FC<AnimatedHeartCheckboxProps> = ({ checked, onChange, id, className = '' }) => {
  return (
    <div className={`inline-block ${className}`} onClick={(e) => e.stopPropagation()}>
      <style>{`
        .heart-checkbox-input {
          display: none;
        }

        .heart-checkbox-label {
          align-self: center;
          position: relative;
          color: #94a3b8; /* slate-400 default */
          font-size: 24px; /* Matches standard icon sizes */
          user-select: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        
        .dark .heart-checkbox-label {
            color: #64748b; /* slate-500 default in dark mode */
        }
        
        /* Hover state for unliked heart */
        .heart-checkbox-label:hover {
            color: #e2264d;
        }

        .heart-checkbox-label svg {
            fill: currentColor;
            width: 1em;
            height: 1em;
            transition: fill 0.2s;
        }

        .heart-checkbox-input:checked + .heart-checkbox-label {
          color: #e2264d;
          will-change: font-size;
          animation: heart-bounce 1s cubic-bezier(0.17, 0.89, 0.32, 1.49);
        }
        
        .heart-checkbox-input:checked + .heart-checkbox-label svg {
            fill: #e2264d;
        }

        .heart-checkbox-input:checked + .heart-checkbox-label:before, 
        .heart-checkbox-input:checked + .heart-checkbox-label:after {
          animation: inherit;
          animation-timing-function: ease-out;
        }

        .heart-checkbox-input:checked + .heart-checkbox-label:before {
          will-change: transform, border-width, border-color;
          animation-name: heart-bubble;
        }

        .heart-checkbox-input:checked + .heart-checkbox-label:after {
          will-change: opacity, box-shadow;
          animation-name: heart-sparkles;
        }

        .heart-checkbox-label:before, .heart-checkbox-label:after {
          position: absolute;
          z-index: -1;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          content: '';
        }

        .heart-checkbox-label:before {
          box-sizing: border-box;
          margin: -1rem;
          border: solid 1rem #e2264d;
          width: 2rem;
          height: 2rem;
          transform: scale(0);
        }

        .heart-checkbox-label:after {
          margin: -0.1rem;
          width: 0.2rem;
          height: 0.2rem;
          /* Initial state: shadows clustered at center */
          box-shadow: 
            0 0 0 0 #ff8080, 
            0 0 0 0 #ffed80, 
            0 0 0 0 #ffed80, 
            0 0 0 0 #a4ff80, 
            0 0 0 0 #a4ff80, 
            0 0 0 0 #80ffc8, 
            0 0 0 0 #80c8ff, 
            0 0 0 0 #a480ff;
        }

        @keyframes heart-bounce {
          0%, 17.5% { font-size: 0; }
        }

        @keyframes heart-bubble {
          15% { transform: scale(1.2); border-color: #cc8ef5; border-width: 1rem; }
          30%, 100% { transform: scale(1.2); border-color: #cc8ef5; border-width: 0; }
        }

        @keyframes heart-sparkles {
          0%, 20% { opacity: 0; }
          25% { 
            opacity: 1; 
            box-shadow: 
            0 -1.3rem 0 -0.05rem #ff8080, 
            0.9rem -0.9rem 0 -0.05rem #ffed80, 
            1.3rem 0 0 -0.05rem #ffed80, 
            0.9rem 0.9rem 0 -0.05rem #a4ff80, 
            0 1.3rem 0 -0.05rem #a4ff80, 
            -0.9rem 0.9rem 0 -0.05rem #80ffc8, 
            -1.3rem 0 0 -0.05rem #80c8ff, 
            -0.9rem -0.9rem 0 -0.05rem #a480ff;
          }
          100% {
            opacity: 0;
            box-shadow: 
            0 -1.8rem 0 -0.05rem #ff8080, 
            1.2rem -1.2rem 0 -0.05rem #ffed80, 
            1.8rem 0 0 -0.05rem #ffed80, 
            1.2rem 1.2rem 0 -0.05rem #a4ff80, 
            0 1.8rem 0 -0.05rem #a4ff80, 
            -1.2rem 1.2rem 0 -0.05rem #80ffc8, 
            -1.8rem 0 0 -0.05rem #80c8ff, 
            -1.2rem -1.2rem 0 -0.05rem #a480ff;
          }
        }
      `}</style>
      <div className="relative flex items-center justify-center">
        <input 
            id={`heart-checkbox-${id}`}
            type="checkbox" 
            className="heart-checkbox-input" 
            checked={checked} 
            onChange={onChange} 
        />
        <label htmlFor={`heart-checkbox-${id}`} className="heart-checkbox-label" aria-label="Like">
            <svg viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        </label>
      </div>
    </div>
  );
};

export default AnimatedHeartCheckbox;
