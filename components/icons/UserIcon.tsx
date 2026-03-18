
import React from 'react';

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M18 21a6 6 0 0 0-12 0" />
  </svg>
);

export default UserIcon;