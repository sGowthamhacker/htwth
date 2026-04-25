
import React from 'react';

const MoveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <path d="M12 8V5l3 3-3 3"/>
    <path d="M12 16v3l3-3-3-3"/>
    <path d="M16 12h3l-3-3 3-3"/>
    <path d="M8 12H5l3-3-3-3"/>
    <path d="M12 16v3l-3-3 3-3"/>
    <path d="M8 12H5l3 3-3 3"/>
    <path d="M12 8V5l-3 3 3 3"/>
    <path d="M16 12h3l-3 3 3 3"/>
  </svg>
);

export default MoveIcon;
