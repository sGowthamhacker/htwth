
import React from 'react';

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="url(#spinnerGradient-spinner)"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <defs>
      <linearGradient id="spinnerGradient-spinner" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" stopOpacity="0" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
    </defs>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default SpinnerIcon;