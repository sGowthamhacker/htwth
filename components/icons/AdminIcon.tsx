import React from 'react';

const AdminIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#FBBF24" stroke="#F59E0B" />
    <polygon points="12 15 9.5 16.5 10 13.5 8 11.5 11 11 12 8 13 11 16 11.5 14 13.5 14.5 16.5" fill="white" stroke="white" strokeLinejoin="round"/>
  </svg>
);

export default AdminIcon;