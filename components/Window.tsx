
import React, { useRef, useEffect, ReactNode, useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import MaximizeIcon from './icons/MaximizeIcon';
import MinimizeIcon from './icons/MinimizeIcon';
import RestoreIcon from './icons/RestoreIcon';
import RefreshIcon from './icons/RefreshIcon';
import { useTheme } from '../contexts/ThemeContext';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface WindowProps {
    id: string;
    appId: string;
    title: string;
    icon: React.ReactElement;
    children: ReactNode;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    isActive: boolean;
    isMaximized: boolean;
    accentColor?: string;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onMaximize: (id: string) => void;
    onFocus: (id: string) => void;
    onBoundsChange: (id: string, bounds: { x: number; y: number; width: number; height: number; }) => void;
    onRefresh: (id: string) => void;
    boundsRef: React.RefObject<HTMLDivElement>;
    isClosing?: boolean;
    initialBounds?: { x: number; y: number; width: number; height: number };
}

const Window: React.FC<WindowProps> = ({
    id, appId, title, icon, children, x, y, width, height, zIndex,
    isActive, isMaximized, accentColor, onClose, onMinimize, onMaximize,
    onFocus, onBoundsChange, onRefresh, boundsRef, isClosing, initialBounds
}) => {
    const { themeStyle } = useTheme();
    const windowRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef<{ 
        type: 'drag' | `resize-${ResizeDirection}`; 
        startX: number; 
        startY: number; 
        initialX: number; 
        initialY: number; 
        initialWidth: number; 
        initialHeight: number;
    } | null>(null);

    const onBoundsChangeRef = useRef(onBoundsChange);
    useEffect(() => { onBoundsChangeRef.current = onBoundsChange; }, [onBoundsChange]);

    const [isMounted, setIsMounted] = useState(false);
    const themeToRender = themeStyle;

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
    }, []);
    
    const getCoords = (e: any) => e.touches?.[0] || e.changedTouches?.[0] || e;

    const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
        if (!interactionRef.current || !boundsRef.current || !windowRef.current) return;
        if ('preventDefault' in e) e.preventDefault();

        const moveCoords = getCoords(e);
        if (!moveCoords) return;

        const { type, startX, startY, initialX, initialY, initialWidth, initialHeight } = interactionRef.current;
        const dx = moveCoords.clientX - startX;
        const dy = moveCoords.clientY - startY;
        
        let newX = initialX, newY = initialY, newWidth = initialWidth, newHeight = initialHeight;
        const parentWidth = boundsRef.current.clientWidth, parentHeight = boundsRef.current.clientHeight;
        const titlebarHeight = 36;

        if (type === 'drag') {
            newX = Math.max(-newWidth + 50, Math.min(initialX + dx, parentWidth - 50));
            newY = Math.max(0, Math.min(initialY + dy, parentHeight - titlebarHeight));
        } else {
            const resizeDir = type.split('-')[1];
            if (resizeDir.includes('e')) newWidth = Math.max(MIN_WIDTH, initialWidth + dx);
            if (resizeDir.includes('s')) newHeight = Math.max(MIN_HEIGHT, initialHeight + dy);
            if (resizeDir.includes('w')) {
                const calculatedWidth = initialWidth - dx;
                newWidth = Math.max(MIN_WIDTH, calculatedWidth);
                newX = initialX + initialWidth - newWidth;
            }
            if (resizeDir.includes('n')) {
                const calculatedHeight = initialHeight - dy;
                newHeight = Math.max(MIN_HEIGHT, calculatedHeight);
                newY = initialY + initialHeight - newHeight;
            }

            if (newX < 0) { newWidth += newX; newX = 0; }
            if (newY < 0) { newHeight += newY; newY = 0; }
            if (newX + newWidth > parentWidth) newWidth = parentWidth - newX;
            if (newY + newHeight > parentHeight) newHeight = parentHeight - newY;
        }
        
        windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        windowRef.current.style.width = `${newWidth}px`;
        windowRef.current.style.height = `${newHeight}px`;
    };
    
    const handleInteractionEnd = () => {
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleInteractionMove);
        document.removeEventListener('touchmove', handleInteractionMove);
        document.removeEventListener('mouseup', handleInteractionEnd);
        document.removeEventListener('touchend', handleInteractionEnd);
        
        if (!interactionRef.current) return;

        const rect = windowRef.current!.getBoundingClientRect();
        const parentRect = boundsRef.current!.getBoundingClientRect();
        const finalBounds = {
            x: rect.left - parentRect.left,
            y: rect.top - parentRect.top,
            width: rect.width,
            height: rect.height,
        };
        
        interactionRef.current = null;
        onBoundsChangeRef.current(id, finalBounds);
    };

    const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, type: 'drag' | `resize-${ResizeDirection}`) => {
        if (isMaximized || ('button' in e && e.button !== 0)) return;
        e.stopPropagation();
        onFocus(id);
        
        const startCoords = getCoords(e);

        interactionRef.current = { type, startX: startCoords.clientX, startY: startCoords.clientY, initialX: x, initialY: y, initialWidth: width, initialHeight: height };
        
        if (windowRef.current) {
            windowRef.current.style.transition = 'none';
        }
        
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleInteractionMove, { passive: false });
        document.addEventListener('touchmove', handleInteractionMove, { passive: false });
        document.addEventListener('mouseup', handleInteractionEnd);
        document.addEventListener('touchend', handleInteractionEnd);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onMaximize(id);
    };

    const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

    const openEase = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
    const closeEase = 'cubic-bezier(0.55, 0.055, 0.675, 0.19)';
    const duration = '250ms';

    const isOpening = !isMounted && !isClosing;
    const scale = isClosing || isOpening ? 0.95 : 1;
    const opacity = isClosing || isOpening ? 0 : 1;
    
    const style: React.CSSProperties = {
        zIndex,
        position: 'absolute',
        top: 0,
        left: 0,
        width: isMaximized ? '100%' : `${width}px`,
        height: isMaximized ? '100%' : `${height}px`,
        transform: `translate(${isMaximized ? 0 : x}px, ${isMaximized ? 0 : y}px) scale(${scale})`,
        opacity: opacity,
        transition: `transform ${duration} ${isClosing ? closeEase : openEase}, opacity ${duration} ${isClosing ? closeEase : openEase}, width ${duration} ${openEase}, height ${duration} ${openEase}, box-shadow 0.2s ease`,
        borderWidth: themeToRender === 'windows' ? '1px' : '0px',
    };
    
    if (interactionRef.current) {
        style.transition = 'none';
    }

    return (
        <div
            ref={windowRef}
            id={id}
            className={`absolute flex flex-col bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700/50 overflow-hidden ${isMaximized ? 'rounded-none' : ''} ${isActive ? 'shadow-2xl' : 'shadow-lg'} ${themeToRender}`}
            style={style}
            onMouseDown={() => onFocus(id)}
            onTouchStart={() => onFocus(id)}
        >
            {!isMaximized && (
                <>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-n')} onTouchStart={(e) => handleInteractionStart(e, 'resize-n')} style={{ cursor: 'n-resize' }} className="absolute h-1.5 top-0 left-2 right-2 z-10"></div>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-s')} onTouchStart={(e) => handleInteractionStart(e, 'resize-s')} style={{ cursor: 's-resize' }} className="absolute h-1.5 bottom-0 left-2 right-2 z-10"></div>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-e')} onTouchStart={(e) => handleInteractionStart(e, 'resize-e')} style={{ cursor: 'e-resize' }} className="absolute w-1.5 right-0 top-2 bottom-2 z-10"></div>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-w')} onTouchStart={(e) => handleInteractionStart(e, 'resize-w')} style={{ cursor: 'w-resize' }} className="absolute w-1.5 left-0 top-2 bottom-2 z-10"></div>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-nw')} onTouchStart={(e) => handleInteractionStart(e, 'resize-nw')} style={{ cursor: 'nw-resize' }} className="absolute w-2 h-2 top-0 left-0 z-20"></div>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-ne')} onTouchStart={(e) => handleInteractionStart(e, 'resize-ne')} style={{ cursor: 'ne-resize' }} className="absolute w-2 h-2 top-0 right-0 z-20"></div>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-sw')} onTouchStart={(e) => handleInteractionStart(e, 'resize-sw')} style={{ cursor: 'sw-resize' }} className="absolute w-2 h-2 bottom-0 left-0 z-20"></div>
                    <div onMouseDown={(e) => handleInteractionStart(e, 'resize-se')} onTouchStart={(e) => handleInteractionStart(e, 'resize-se')} style={{ cursor: 'se-resize' }} className="absolute w-2 h-2 bottom-0 right-0 z-20"></div>
                </>
            )}
            
            <header
                className={`flex items-center flex-shrink-0 transition-colors duration-200 ${themeToRender === 'windows' ? 'h-9 justify-between pl-3 pr-1' : 'relative h-8 justify-center'} ${isActive ? '' : 'bg-slate-200 dark:bg-slate-800/50'}`}
                style={{ 
                    cursor: isMaximized ? 'default' : 'grab', 
                    backgroundColor: (themeToRender === 'windows' && isActive) ? accentColor : undefined,
                    touchAction: 'none'
                }}
                onDoubleClick={handleDoubleClick}
                onMouseDown={isMaximized ? undefined : (e) => handleInteractionStart(e, 'drag')} 
                onTouchStart={isMaximized ? undefined : (e) => handleInteractionStart(e, 'drag')}
            >
                {themeToRender === 'windows' ? (
                  <>
                    <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                        {React.cloneElement(icon, { className: `w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-200'}` })}
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{title}</span>
                    </div>
                    <div className={`flex items-center ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`} onMouseDown={stopPropagation} onTouchStart={stopPropagation}>
                        <div className="window-controls flex items-center">
                            <button onClick={() => onRefresh(id)} className={`p-2 h-9 w-9 flex items-center justify-center rounded-sm ${isActive ? 'hover:bg-black/10' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} style={{cursor: 'default'}} title="Refresh"><RefreshIcon className="w-4 h-4" /></button>
                            <button onClick={() => onMinimize(id)} className={`window-control-minimize p-2 h-9 w-9 flex items-center justify-center rounded-sm ${isActive ? 'hover:bg-black/10' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} style={{cursor: 'default'}}><MinimizeIcon className="w-3.5 h-3.5" /></button>
                            <button onClick={() => onMaximize(id)} className={`window-control-maximize p-2 h-9 w-9 flex items-center justify-center rounded-sm ${isActive ? 'hover:bg-black/10' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} style={{cursor: 'default'}}>
                                {isMaximized ? <RestoreIcon className="w-3.5 h-3.5" /> : <MaximizeIcon className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => onClose(id)} className="window-control-close p-2 h-9 w-9 flex items-center justify-center rounded-sm hover:bg-red-500 hover:text-white" style={{cursor: 'default'}}><CloseIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2" onMouseDown={stopPropagation} onTouchStart={stopPropagation}>
                        <button onClick={() => onClose(id)} className="mac-control group w-3 h-3 bg-red-500 rounded-full flex justify-center items-center" style={{cursor: 'default'}}>
                            <svg viewBox="0 0 12 12" className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                <path d="M1 1 L11 11 M1 11 L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <button onClick={() => onMinimize(id)} className="mac-control group w-3 h-3 bg-yellow-500 rounded-full flex justify-center items-center" style={{cursor: 'default'}}>
                            <svg viewBox="0 0 12 12" className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                <path d="M2 6 L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <button onClick={() => onMaximize(id)} className="mac-control group w-3 h-3 bg-green-500 rounded-full flex justify-center items-center" style={{cursor: 'default'}}>
                            <svg viewBox="0 0 12 12" className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                <path d="M2 6 L10 6 M6 2 L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 text-center pointer-events-none">
                        {title && <span className="text-sm font-semibold truncate">{title}</span>}
                    </div>
                  </>
                )}
            </header>

            <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-900">
                {children}
            </div>
        </div>
    );
};

export default React.memo(Window);
