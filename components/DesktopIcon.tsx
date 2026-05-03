
import React, { useRef, useEffect } from 'react';
import { AppDefinition, DesktopIconSize } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface DesktopIconProps {
  app: AppDefinition;
  onOpen: (appId: string, props: {}, initialBounds?: DOMRect) => void;
  x: number;
  y: number;
  onPositionChange: (appId: string, pos: { x: number; y: number }) => void;
  boundsRef: React.RefObject<HTMLDivElement>;
  isSelected: boolean;
  onSelect: (appId: string) => void;
  size: DesktopIconSize;
}

const sizeClasses: Record<DesktopIconSize, { container: string; iconContainer: string; icon: string; }> = {
    small: { container: 'w-20 h-20', iconContainer: 'w-10 h-10', icon: 'w-8 h-8' },
    medium: { container: 'w-24 h-24', iconContainer: 'w-12 h-12', icon: 'w-10 h-10' },
    large: { container: 'w-28 h-28', iconContainer: 'w-14 h-14', icon: 'w-12 h-12' },
};


const DesktopIcon: React.FC<DesktopIconProps> = ({ app, onOpen, x, y, onPositionChange, boundsRef, isSelected, onSelect, size }) => {
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean } | null>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const { themeStyle } = useTheme();

  const getCoords = (e: any) => e.touches?.[0] || e.changedTouches?.[0] || e;

  const handleInteractionStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if ('button' in e && e.button !== 0) return;
    
    e.stopPropagation();
    onSelect(app.id);
    
    const startCoords = getCoords(e);
    
    let initialX = x;
    let initialY = y;
    if (iconRef.current) {
        const style = window.getComputedStyle(iconRef.current);
        const matrix = new DOMMatrix(style.transform);
        initialX = matrix.m41;
        initialY = matrix.m42;
    }
    
    dragRef.current = {
      startX: startCoords.clientX,
      startY: startCoords.clientY,
      initialX,
      initialY,
      moved: false,
    };
    
    document.addEventListener('mousemove', handleInteractionMove);
    document.addEventListener('touchmove', handleInteractionMove, { passive: false });
    document.addEventListener('mouseup', handleInteractionEnd);
    document.addEventListener('touchend', handleInteractionEnd);
  };

  const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
    if (!dragRef.current || !iconRef.current || !boundsRef.current) return;
    
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    
    const moveCoords = getCoords(e);
    if (!moveCoords) return;
    
    const dx = moveCoords.clientX - dragRef.current.startX;
    const dy = moveCoords.clientY - dragRef.current.startY;

    if (!dragRef.current.moved && (Math.abs(dx) < 5 && Math.abs(dy) < 5)) {
        return;
    }
    dragRef.current.moved = true;
    
    let newX = dragRef.current.initialX + dx;
    let newY = dragRef.current.initialY + dy;
    
    const parentWidth = boundsRef.current.clientWidth;
    const parentHeight = boundsRef.current.clientHeight;
    const iconWidth = iconRef.current.offsetWidth;
    const iconHeight = iconRef.current.offsetHeight;
    
    newX = Math.max(0, Math.min(newX, parentWidth - iconWidth));
    newY = Math.max(0, Math.min(newY, parentHeight - iconHeight));
    
    iconRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
  };

  const handleInteractionEnd = (e: MouseEvent | TouchEvent) => {
    document.removeEventListener('mousemove', handleInteractionMove);
    document.removeEventListener('touchmove', handleInteractionMove);
    document.removeEventListener('mouseup', handleInteractionEnd);
    document.removeEventListener('touchend', handleInteractionEnd);
    
    if (!dragRef.current) return;
    
    const endCoords = getCoords(e);

    if (dragRef.current.moved) {
      if (boundsRef.current && endCoords) {
        const dx = endCoords.clientX - dragRef.current.startX;
        const dy = endCoords.clientY - dragRef.current.startY;
        
        let finalX = dragRef.current.initialX + dx;
        let finalY = dragRef.current.initialY + dy;
        
        const parentWidth = boundsRef.current.clientWidth;
        const parentHeight = boundsRef.current.clientHeight;
        const iconWidth = iconRef.current?.offsetWidth || 96;
        const iconHeight = iconRef.current?.offsetHeight || 96;
        
        finalX = Math.max(0, Math.min(finalX, parentWidth - iconWidth));
        finalY = Math.max(0, Math.min(finalY, parentHeight - iconHeight));

        if (iconRef.current) {
          iconRef.current.style.transform = `translate(${finalX}px, ${finalY}px)`;
        }
        onPositionChange(app.id, { x: finalX, y: finalY });
      }
    } else {
      onOpen(app.id, {}, iconRef.current?.getBoundingClientRect());
    }
    
    // Defer setting dragRef to null to prevent a race condition with the useEffect
    // that positions the icon declaratively.
    setTimeout(() => {
        dragRef.current = null;
    }, 0);
  };

  useEffect(() => {
    if (iconRef.current && !dragRef.current) {
        iconRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [x, y]);

  const currentSizeClasses = sizeClasses[size];

  const textClasses = 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]';

  return (
    <button
      ref={iconRef}
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      onDoubleClick={(e) => e.stopPropagation()}
      className={`absolute flex flex-col items-center justify-center p-2 rounded-md focus:outline-none transition-colors duration-75 ${currentSizeClasses.container} ${isSelected ? 'bg-white/20' : 'hover:bg-white/10'}`}
      title={app.name}
      aria-label={`Open ${app.name}`}
      style={{
        top: 0,
        left: 0,
        touchAction: 'none',
      }}
    >
      <div className={`flex items-center justify-center drop-shadow-lg ${currentSizeClasses.iconContainer}`}>
        {React.cloneElement(app.icon as React.ReactElement<any>, { className: `text-white ${currentSizeClasses.icon}` })}
      </div>
      <span
        className={`text-xs font-medium mt-1 text-center break-words leading-tight px-1 
                    ${textClasses}
                    ${isSelected ? 'bg-blue-600/90 rounded-sm !text-white ![text-shadow:none]' : ''}`}
      >
        {app.name}
      </span>
    </button>
  );
};

export default DesktopIcon;
