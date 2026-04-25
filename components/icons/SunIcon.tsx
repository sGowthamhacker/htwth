
import React from 'react';

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      <linearGradient id="sunGradient-sun" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="4" fill="url(#sunGradient-sun)" stroke="none" />
    <path d="M12 2v2" stroke="#F59E0B" />
    <path d="M12 20v2" stroke="#F59E0B" />
    <path d="m4.93 4.93 1.41 1.41" stroke="#F59E0B" />
    <path d="m17.66 17.66 1.41 1.41" stroke="#F59E0B" />
    <path d="M2 12h2" stroke="#F59E0B" />
    <path d="M20 12h2" stroke="#F59E0B" />
    <path d="m4.93 19.07 1.41-1.41" stroke="#F59E0B" />
    <path d="m17.66 6.34 1.41-1.41" stroke="#F59E0B" />
  </svg>
);

export default SunIcon;