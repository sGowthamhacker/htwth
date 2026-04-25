
import React from 'react';

const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="8" cy="15" r="4" />
    <path d="M10.85 12.15L19 4" />
    <path d="M18 5L20 7" />
    <path d="M15 8L17 10" />
  </svg>
);

export default KeyIcon;
