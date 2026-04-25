import React from 'react';

const LiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#FECDD3" stroke="#F43F5E" />
    <circle cx="12" cy="12" r="4" fill="white" stroke="#F43F5E" strokeWidth="2" />
    <path d="M12 16a8 8 0 0 0 0-8" stroke="#F43F5E" strokeWidth="1.5" />
    <path d="M12 18a10 10 0 0 0 0-12" stroke="#F43F5E" strokeWidth="1.5" />
  </svg>
);

export default LiveIcon;