import React from 'react';

const ResizeHandleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10 10"
    fill="currentColor"
    {...props}
  >
    <path d="M 0 10 L 10 0 L 10 2 L 2 10 Z" />
    <path d="M 4 10 L 10 4 L 10 6 L 6 10 Z" />
  </svg>
);

export default ResizeHandleIcon;
