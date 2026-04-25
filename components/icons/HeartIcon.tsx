import React, { useState, useEffect, useRef } from 'react';

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement> & { filled?: boolean }> = ({ filled = false, ...props }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevFilled = useRef(filled);

  useEffect(() => {
    // Animate only when the state changes from not filled to filled.
    if (!prevFilled.current && filled) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400); // Corresponds to animation duration
      return () => clearTimeout(timer);
    }
    // Update the ref for the next render.
    prevFilled.current = filled;
  }, [filled]);

  const { className, ...restProps } = props;
  const animationClass = isAnimating ? 'animate-heart-pop' : '';
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" 
      strokeWidth={filled ? 0 : 1.5}
      className={`${className || ''} ${animationClass}`} 
      {...restProps}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.344-.688 15.247 15.247 0 01-1.344.688l-.022.012-.007.003h-.001M12 21.75l.001-.001L12 21.75h.001zM12 21.75L11.999 21.75l.001.001h-.001zM21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
      />
    </svg>
  );
};

export default HeartIcon;
