
import React from 'react';

const DocIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="#E2E8F0" stroke="#64748B"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="#F1F5F9" stroke="#64748B"/>
    <path d="M7 13h3" stroke="#94A3B8" strokeWidth="1.5" />
    <path d="M7 9h3" stroke="#94A3B8" strokeWidth="1.5" />
    <path d="M14 9h3" stroke="#94A3B8" strokeWidth="1.5" />
    <path d="M14 13h3" stroke="#94A3B8" strokeWidth="1.5" />
    <path d="M14 17h3" stroke="#94A3B8" strokeWidth="1.5" />
  </svg>
);

export default DocIcon;
