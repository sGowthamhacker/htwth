
import React from 'react';

const AppsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="none"
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" rx="1" fill="#f87171" /> 
    <rect x="14" y="3" width="7" height="7" rx="1" fill="#4ade80" />
    <rect x="14" y="14" width="7" height="7" rx="1" fill="#38bdf8" />
    <rect x="3" y="14" width="7" height="7" rx="1" fill="#facc15" />
  </svg>
);

export default AppsIcon;
