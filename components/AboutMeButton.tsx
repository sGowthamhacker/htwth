
import React from 'react';

interface AboutMeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const AboutMeButton: React.FC<AboutMeButtonProps> = (props) => {
  return (
    <div className="relative inline-block">
      <style>{`
        .about-me-btn {
         padding: 0.8em 2em;
         margin: 0.5em;
         background: transparent;
         color: #4f46e5; /* Indigo 600 */
         border: 2px solid #4f46e5;
         border-radius: 0.625em;
         font-size: 17px;
         font-weight: 700;
         cursor: pointer;
         position: relative;
         z-index: 1;
         overflow: hidden;
         display: flex;
         align-items: center;
         justify-content: center;
         transition: color 0.4s ease;
         font-family: inherit;
         text-transform: uppercase;
         letter-spacing: 1px;
        }

        .dark .about-me-btn {
          color: #818cf8; /* Indigo 400 */
          border-color: #818cf8;
        }

        .about-me-btn:hover {
         color: white;
        }
        
        .dark .about-me-btn:hover {
          color: black;
        }

        .about-me-btn:after {
         content: "";
         background: #000000;
         position: absolute;
         z-index: -1;
         left: -20%;
         right: -20%;
         top: 0;
         bottom: 0;
         transform: skewX(-45deg) scale(0, 1);
         transition: all 0.4s ease;
        }
        
        .dark .about-me-btn:after {
          background: #ffffff;
        }

        .about-me-btn:hover:after {
         transform: skewX(-45deg) scale(1, 1);
        }
      `}</style>
      <button className="about-me-btn" {...props}>
        About Me
      </button>
    </div>
  );
}

export default AboutMeButton;