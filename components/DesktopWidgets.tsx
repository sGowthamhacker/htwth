import React, { useState, useEffect, useRef } from 'react';
import { WidgetState, Timezone } from '../types';
import ResizeHandleIcon from './icons/ResizeHandleIcon';
import { useTime } from '../contexts/TimeContext';
import { useTheme } from '../contexts/ThemeContext';

type InteractionType = 'drag' | 'resize-n' | 'resize-s' | 'resize-e' | 'resize-w' | 'resize-ne' | 'resize-nw' | 'resize-se' | 'resize-sw';

interface DesktopWidgetsProps {
  state: WidgetState;
  onStateChange: (newState: WidgetState) => void;
  boundsRef: React.RefObject<HTMLDivElement>;
}

const MIN_WIDTH = 160;
const MIN_HEIGHT = 80;

const DesktopWidgets: React.FC<DesktopWidgetsProps> = ({ state, onStateChange, boundsRef }) => {
    const { timeFormat, visibleTimezones } = useTime();
    const { themeMode, themeStyle } = useTheme();
    const [time, setTime] = useState(new Date());
    const widgetRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef<{ type: InteractionType; startX: number; startY: number; initialX: number; initialY: number; initialWidth: number; initialHeight: number; } | null>(null);
    const isInteracting = useRef(false);
    const onStateChangeRef = useRef(onStateChange);

    useEffect(() => { onStateChangeRef.current = onStateChange; }, [onStateChange]);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const getCoords = (e: any) => e.touches?.[0] || e.changedTouches?.[0] || e;

    const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
        if (!interactionRef.current || !widgetRef.current || !boundsRef.current) return;
        if ('preventDefault' in e) e.preventDefault();

        const moveCoords = getCoords(e);
        if (!moveCoords) return;

        const { type, startX, startY, initialX, initialY, initialWidth, initialHeight } = interactionRef.current;
        const dx = moveCoords.clientX - startX;
        const dy = moveCoords.clientY - startY;
        
        let newX = initialX, newY = initialY, newWidth = initialWidth, newHeight = initialHeight;
        const parentWidth = boundsRef.current.clientWidth;
        const parentHeight = boundsRef.current.clientHeight;

        if (type === 'drag') {
            newX = Math.max(0, Math.min(initialX + dx, parentWidth - newWidth));
            newY = Math.max(0, Math.min(initialY + dy, parentHeight - newHeight));
            document.body.style.cursor = 'grabbing';
        } else {
            const resizeDir = type.split('-')[1];

            if (resizeDir.includes('e')) { // Right
                newWidth = Math.max(MIN_WIDTH, initialWidth + dx);
            }
            if (resizeDir.includes('s')) { // Bottom
                newHeight = Math.max(MIN_HEIGHT, initialHeight + dy);
            }
            if (resizeDir.includes('w')) { // Left
                const calculatedWidth = initialWidth - dx;
                newWidth = Math.max(MIN_WIDTH, calculatedWidth);
                newX = initialX + initialWidth - newWidth;
            }
            if (resizeDir.includes('n')) { // Top
                const calculatedHeight = initialHeight - dy;
                newHeight = Math.max(MIN_HEIGHT, calculatedHeight);
                newY = initialY + initialHeight - newHeight;
            }
        }

        if (newX < 0) { newWidth += newX; newX = 0; }
        if (newY < 0) { newHeight += newY; newY = 0; }
        if (newX + newWidth > parentWidth) newWidth = parentWidth - newX;
        if (newY + newHeight > parentHeight) newHeight = parentHeight - newY;
        
        widgetRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        widgetRef.current.style.width = `${newWidth}px`;
        widgetRef.current.style.height = `${newHeight}px`;
    };
    
    const handleInteractionEnd = () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleInteractionMove);
        document.removeEventListener('touchmove', handleInteractionMove);
        document.removeEventListener('mouseup', handleInteractionEnd);
        document.removeEventListener('touchend', handleInteractionEnd);
        
        if (widgetRef.current) widgetRef.current.style.opacity = '1';
        if (!interactionRef.current) return;
        
        const rect = widgetRef.current!.getBoundingClientRect();
        const parentRect = boundsRef.current!.getBoundingClientRect();
        
        onStateChangeRef.current({
            x: rect.left - parentRect.left,
            y: rect.top - parentRect.top,
            width: rect.width,
            height: rect.height,
        });

        interactionRef.current = null;
        setTimeout(() => { isInteracting.current = false; }, 0);
    };

    const handleInteractionStart = (type: InteractionType) => (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in e && e.button !== 0) return;
        e.stopPropagation();

        const startCoords = getCoords(e);

        interactionRef.current = { type, startX: startCoords.clientX, startY: startCoords.clientY, initialX: state.x, initialY: state.y, initialWidth: state.width, initialHeight: state.height };
        isInteracting.current = true;

        if (widgetRef.current) {
            widgetRef.current.style.transition = 'none';
            widgetRef.current.style.opacity = '0.9';
        }

        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleInteractionMove, { passive: false });
        document.addEventListener('touchmove', handleInteractionMove, { passive: false });
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('touchend', handleInteractionEnd);
    };

    useEffect(() => {
        if (widgetRef.current && !isInteracting.current) {
            widgetRef.current.style.transition = 'opacity 0.2s ease, transform 0.2s ease, width 0.2s ease, height 0.2s ease';
            widgetRef.current.style.width = `${state.width}px`;
            widgetRef.current.style.height = `${state.height}px`;
            widgetRef.current.style.transform = `translate(${state.x}px, ${state.y}px)`;
        }
    }, [state.x, state.y, state.width, state.height]);

    // Responsive visibility conditions
    const showSeconds = state.width > 240;

    const getTimeOptions = (tzId: Timezone): Intl.DateTimeFormatOptions => {
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: showSeconds ? '2-digit' : undefined,
            hour12: timeFormat === '12hr',
        };
        if (tzId !== 'local') {
            options.timeZone = tzId === 'IST' ? 'Asia/Kolkata' : 'UTC';
        }
        return options;
    };

    const dateString = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // --- New responsive font size logic ---
    const numClocks = visibleTimezones.length;
    const availableHeight = Math.max(0, state.height - 24); // padding
    const showDate = state.height > 120 && numClocks < 3;
    const dateHeight = showDate ? Math.max(10, Math.min(state.width / 14, availableHeight * 0.25, 28)) : 0;
    const clockAreaHeight = availableHeight - dateHeight;

    const singleClockHeight = clockAreaHeight / numClocks;
    const clockFontSize = Math.max(12, Math.min(state.width / 6, singleClockHeight * 0.7, 72));
    const labelFontSize = Math.max(10, clockFontSize * 0.4);

    const textAndShadowClasses = 'text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]';
    const borderClasses = 'border-white/50';
    const handleClasses = 'text-white/50 hover:text-white/80';


    return (
        <div
            ref={widgetRef}
            onMouseDown={handleInteractionStart('drag')}
            onTouchStart={handleInteractionStart('drag')}
            className={`absolute group text-right p-4 flex flex-col justify-center items-end rounded-lg cursor-grab active:cursor-grabbing ${textAndShadowClasses}`}
            style={{
                top: 0,
                left: 0,
                touchAction: 'none',
            }}
        >
            <div className="absolute inset-0 p-4 flex flex-col justify-center items-end pointer-events-none">
                 {visibleTimezones.map(tzId => (
                    <div key={tzId} className="text-right">
                        <div
                            className="font-bold whitespace-nowrap"
                            style={{ fontSize: `${clockFontSize}px`, lineHeight: 1.1 }}
                        >
                            {time.toLocaleTimeString([], getTimeOptions(tzId))}
                        </div>
                        {tzId !== 'local' && (
                            <div 
                                className="font-semibold whitespace-nowrap -mt-1"
                                style={{ fontSize: `${labelFontSize}px`, lineHeight: 1.1 }}
                            >
                                {tzId}
                            </div>
                        )}
                    </div>
                ))}
    
                {showDate && (
                     <div
                        className="font-medium whitespace-nowrap mt-2"
                        style={{ fontSize: `${dateHeight * 0.7}px`, lineHeight: 1.1 }}
                    >
                        {dateString}
                    </div>
                )}
            </div>
            
            <div className={`absolute inset-0 border-2 border-dashed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${borderClasses}`}></div>

            {/* Resize Edges */}
            <div onMouseDown={handleInteractionStart('resize-n')} onTouchStart={handleInteractionStart('resize-n')} className="absolute h-2 top-0 left-2 right-2 cursor-n-resize z-10"></div>
            <div onMouseDown={handleInteractionStart('resize-s')} onTouchStart={handleInteractionStart('resize-s')} className="absolute h-2 bottom-0 left-2 right-2 cursor-s-resize z-10"></div>
            <div onMouseDown={handleInteractionStart('resize-e')} onTouchStart={handleInteractionStart('resize-e')} className="absolute w-2 right-0 top-2 bottom-2 cursor-e-resize z-10"></div>
            <div onMouseDown={handleInteractionStart('resize-w')} onTouchStart={handleInteractionStart('resize-w')} className="absolute w-2 left-0 top-2 bottom-2 cursor-w-resize z-10"></div>

            {/* Resize Corners (visual handles) */}
            <div onMouseDown={handleInteractionStart('resize-nw')} onTouchStart={handleInteractionStart('resize-nw')} className={`absolute w-4 h-4 top-0 left-0 cursor-nw-resize p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${handleClasses}`}><ResizeHandleIcon className="transform -rotate-90"/></div>
            <div onMouseDown={handleInteractionStart('resize-ne')} onTouchStart={handleInteractionStart('resize-ne')} className={`absolute w-4 h-4 top-0 right-0 cursor-ne-resize p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${handleClasses}`}><ResizeHandleIcon className="transform rotate-0"/></div>
            <div onMouseDown={handleInteractionStart('resize-sw')} onTouchStart={handleInteractionStart('resize-sw')} className={`absolute w-4 h-4 bottom-0 left-0 cursor-sw-resize p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${handleClasses}`}><ResizeHandleIcon className="transform -rotate-180"/></div>
            <div onMouseDown={handleInteractionStart('resize-se')} onTouchStart={handleInteractionStart('resize-se')} className={`absolute w-4 h-4 bottom-0 right-0 cursor-se-resize p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${handleClasses}`}><ResizeHandleIcon className="transform rotate-90"/></div>
        </div>
    );
};

export default DesktopWidgets;
