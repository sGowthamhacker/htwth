
import React from 'react';

const DisplayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2" fill="#E2E8F0"/>
    <path d="M2 17H22" />
    <path d="M8 21H16" />
    <path d="M12 17V21" />
  </svg>
);

export default DisplayIcon;
