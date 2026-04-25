
import React from 'react';

interface PlusButtonProps {
  onClick?: () => void;
  title?: string;
  className?: string;
  text?: string;
}

const PlusButton: React.FC<PlusButtonProps> = ({ onClick, title, className = '', text }) => {
  return (
    <div className={`plus-btn-wrapper ${className}`} onClick={onClick} title={title}>
      <style>{`
        .plus-btn-wrapper {
            display: inline-block;
        }
        .plusButton {
          /* Config start */
          --plus_sideLength: 2.5rem;
          --plus_topRightTriangleSideLength: 0.9rem;
          /* Config end */
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid white;
          width: var(--plus_sideLength);
          height: var(--plus_sideLength);
          background-color: #000000;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
        }
        
        /* Text support styles */
        .plusButton.with-text {
            width: auto;
            padding-left: 0.8rem;
            padding-right: 1.2rem;
            gap: 0.5rem;
        }
        
        .dark .plusButton {
            border-color: #475569;
        }

        .plusButton::before {
          position: absolute;
          content: "";
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-width: 0 var(--plus_topRightTriangleSideLength) var(--plus_topRightTriangleSideLength) 0;
          border-style: solid;
          border-color: transparent white transparent transparent;
          transition-timing-function: ease-in-out;
          transition-duration: 0.2s;
        }

        .plusButton:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .plusButton:hover::before {
          /* Increase size significantly to cover text width */
          --plus_topRightTriangleSideLength: 20rem; 
        }

        .plusButton:focus-visible::before {
          --plus_topRightTriangleSideLength: 20rem;
        }

        .plusButton > .plusIcon {
          fill: white;
          width: calc(var(--plus_sideLength) * 0.6);
          height: calc(var(--plus_sideLength) * 0.6);
          z-index: 1;
          transition-timing-function: ease-in-out;
          transition-duration: 0.2s;
          flex-shrink: 0;
        }

        .plusButton:hover > .plusIcon {
          fill: black;
          transform: rotate(180deg);
        }

        .plusButton:focus-visible > .plusIcon {
          fill: black;
          transform: rotate(180deg);
        }
        
        .plusButtonText {
            z-index: 1;
            color: white;
            font-weight: 600;
            font-size: 0.85rem;
            white-space: nowrap;
            transition-timing-function: ease-in-out;
            transition-duration: 0.2s;
        }
        
        .plusButton:hover > .plusButtonText {
            color: black;
        }
      `}</style>
      <div tabIndex={0} className={`plusButton shadow-sm ${text ? 'with-text' : ''}`} role="button" aria-label={title || text || "Add"}>
        <svg className="plusIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
            <path d="M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z" />
        </svg>
        {text && <span className="plusButtonText">{text}</span>}
      </div>
    </div>
  );
}

export default PlusButton;
