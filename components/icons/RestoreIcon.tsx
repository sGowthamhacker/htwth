
import React from 'react';

const RestoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <rect x="8" y="8" width="12" height="12" rx="1" />
    <path d="M4 16V6a2 2 0 0 1 2-2h10" />
  </svg>
);

export default RestoreIcon;
