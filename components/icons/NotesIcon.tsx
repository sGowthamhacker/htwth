import React from 'react';

const NotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" fill="#FBBF24" stroke="#F59E0B" />
    <path d="M15 3v6h6" stroke="#F59E0B" />
    <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="1.5" />
    <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="1.5" />
    <line x1="10" y1="9" x2="8" y2="9" stroke="white" strokeWidth="1.5" />
  </svg>
);

export default NotesIcon;
