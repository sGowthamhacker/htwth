import React from 'react';

const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      <linearGradient id="portfolioGrad-briefcase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8"/>
        <stop offset="100%" stopColor="#A78BFA"/>
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#portfolioGrad-briefcase)" stroke="none"/>
    <path d="M9 9l-2 2 2 2" stroke="white" strokeWidth="2.5"/>
    <path d="M15 9l2 2-2 2" stroke="white" strokeWidth="2.5"/>
    <path d="M13 7l-2 10" stroke="white" strokeWidth="2.5"/>
  </svg>
);

export default BriefcaseIcon;