import React from 'react';

const BlogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2h0z" fill="#A5F3FC"></path>
    <path d="M4 18h12" stroke="#0891B2" />
    <path d="M4 14h12" stroke="#0891B2" />
    <path d="M4 10h12" stroke="#0891B2" />
    <path d="M4 6h12" stroke="#0891B2" />
    <path d="M18 2h4v8h-4z" fill="#22D3EE" stroke="#0891B2"/>
  </svg>
);

export default BlogIcon;
