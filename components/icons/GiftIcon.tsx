import React from 'react';

const GiftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 6H4C2.9 6 2 6.9 2 8v2h20V8c0-1.1-.9-2-2-2m0 12H4c-1.1 0-2-.9-2-2v-4h20v4c0 1.1-.9 2-2 2M12 1c-2.76 0-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5Z"/>
  </svg>
);

export default GiftIcon;
