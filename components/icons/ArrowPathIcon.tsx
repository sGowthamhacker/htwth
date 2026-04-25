import React from 'react';

const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-5h-5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 01-8 8h-4" />
  </svg>
);

export default ArrowPathIcon;