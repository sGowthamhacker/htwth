import React from 'react';

const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5.52 19c.64-2.2 1.84-4 3.22-5.26C10.1 12.5 12 12 12 12s1.9-.5 3.26-1.74c1.38-1.26 2.58-3.06 3.22-5.26" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default UserCircleIcon;
