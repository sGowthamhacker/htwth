
import React, { useState, useEffect, useRef } from 'react';

export type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out' | 'fade-in';

interface RevealOnScrollProps {
    children: React.ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ 
    children, 
    animation = 'fade-up', 
    delay = 0, 
    duration = 800, 
    threshold = 0.1, 
    className = '' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            });
        }, { threshold });

        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [threshold]);

    const getInitialStyle = () => {
        switch (animation) {
            case 'fade-up': return 'translate-y-16 opacity-0';
            case 'fade-down': return '-translate-y-16 opacity-0';
            case 'fade-left': return 'translate-x-16 opacity-0';
            case 'fade-right': return '-translate-x-16 opacity-0';
            case 'zoom-in': return 'scale-90 opacity-0';
            case 'zoom-out': return 'scale-110 opacity-0';
            case 'fade-in': return 'opacity-0';
            default: return 'translate-y-16 opacity-0';
        }
    };

    const getFinalStyle = () => {
        switch (animation) {
            case 'zoom-in':
            case 'zoom-out':
                return 'scale-100 opacity-100';
            case 'fade-left':
            case 'fade-right':
                return 'translate-x-0 opacity-100';
            case 'fade-up':
            case 'fade-down':
                return 'translate-y-0 opacity-100';
            case 'fade-in': return 'opacity-100';
            default: return 'translate-y-0 opacity-100';
        }
    };

    return (
        <div
            ref={domRef}
            className={`transition-all cubic-bezier(0.22, 1, 0.36, 1) ${isVisible ? getFinalStyle() : getInitialStyle()} ${className}`}
            style={{ 
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    );
};

export default RevealOnScroll;
