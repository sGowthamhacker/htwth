import React from 'react';

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M2 11.5A10 10 0 0 1 12 2a10 10 0 0 1 9.5 9.5" />
    <path d="M22 12.5a10 10 0 0 1-10 10a10 10 0 0 1-9.5-9.5" />
  </svg>
);

export default RefreshIcon;