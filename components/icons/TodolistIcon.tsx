import React from 'react';

const TodolistIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#D1FAE5" stroke="#10B981" />
    <path d="m9 12 2 2 4-4" stroke="#10B981" strokeWidth="2.5" />
    <line x1="9" y1="17" x2="15" y2="17" stroke="#34D399" />
    <line x1="9" y1="7" x2="15" y2="7" stroke="#34D399" />
  </svg>
);

export default TodolistIcon;
