
import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <linearGradient id="sparkleGradient-sparkles" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M12 2L13.89 8.11L20 10L13.89 11.89L12 18L10.11 11.89L4 10L10.11 8.11L12 2Z" fill="url(#sparkleGradient-sparkles)" stroke="#8B5CF6" strokeWidth="1.5"/>
      <path d="M5 21L6 17" stroke="#A78BFA" />
      <path d="M19 21L18 17" stroke="#A78BFA" />
    </svg>
);

export default SparklesIcon;