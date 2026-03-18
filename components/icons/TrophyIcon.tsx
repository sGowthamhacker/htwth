
import React from 'react';

const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172V9.406c0-4.142-3.358-7.5-7.5-7.5-.621 0-1.125.504-1.125 1.125v1.125m9.375 9.375a7.454 7.454 0 00.982-3.172V9.406c0-4.142 3.358-7.5 7.5-7.5.621 0 1.125.504 1.125 1.125v1.125m-18 0h3.375M19.125 4.125h3.375" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.125v3.375c0 .621.504 1.125 1.125 1.125h.872m-8.744 0h.872c.621 0 1.125-.504 1.125-1.125V4.125" />
  </svg>
);

export default TrophyIcon;