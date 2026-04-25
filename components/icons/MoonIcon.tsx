
import React from 'react';

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
        <linearGradient id="moonGradient-moon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
    </defs>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#moonGradient-moon)" stroke="#6366F1" />
    <path d="M19 5v0" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
    <path d="M21 8v0" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
  </svg>
);

export default MoonIcon;