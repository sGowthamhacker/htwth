
import React, { useEffect, useRef, useState } from 'react';

interface WelcomeAnimationProps {
  onComplete: () => void; // Renamed from onAnimationEnd to match user request
  username: string;
  durationMs?: number;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete, username, durationMs = 8000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  
  // Scroll Lock Effect: Prevents background scrolling/jitter during animation
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    // Fallback timeout to ensure completion even if animation events fail
    // The total duration includes the main animation + fade out time
    const fadeOutDuration = 500;
    
    let finalTimer: NodeJS.Timeout;
    
    const endTimer = setTimeout(() => {
      setIsExiting(true);
      
      // Final completion callback
      finalTimer = setTimeout(() => {
        onComplete();
      }, fadeOutDuration);
      
    }, durationMs);

    return () => {
      clearTimeout(endTimer);
      if (finalTimer) clearTimeout(finalTimer);
    };
  }, [onComplete, durationMs]);
  
  const fullText = `Welcome\u00A0${username}\u00A0👋`;
  const characters = Array.from(fullText);

  const animatedSpans = characters.map((char, index) => {
    const font01_delay = 0.18 + index * 0.072;
    const font02_delay = 3.25 + index * 0.036;
    
    let animations = `animation_font01 0.36s cubic-bezier(0.165, 0.84, 0.44, 1) ${font01_delay}s forwards, animation_font02 1.44s ease-in-out ${font02_delay}s forwards`;
    
    const isEmoji = char === '👋';
    if (isEmoji) {
        // Start waving shortly after the character appears
        const waveDelay = font01_delay + 0.45;
        animations += `, emoji-wave 2.26s ease-in-out ${waveDelay}s infinite`;
    }

    const style: React.CSSProperties = {
      animation: animations,
      // Add transform-origin for the emoji to wave from its "wrist"
      transformOrigin: isEmoji ? '70% 70%' : 'center',
    };

    return (
      <span key={index} style={style}>
        {char}
      </span>
    );
  });


  return (
    // Forced inline styles to guarantee overlay behavior over any existing CSS conflicts
    <div 
        ref={rootRef}
        className={`animation-container ${isExiting ? 'is-exiting' : ''}`}
        style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none' // Allow clicks to pass through if needed, but mostly blocks
        }}
    >
      <div className="animation" style={{ pointerEvents: 'auto' }}>
        <div className="animation_title01_wrap">
          <h2 className="animation_title01">
            {animatedSpans}
          </h2>
        </div>
        <div className="animation_bg01"></div>
        <div className="animation_bg02 animation_common_bg01"></div>
        <div className="animation_bg03 animation_common_bg01"></div>
        <div className="animation_bg04 animation_common_bg01"></div>
        <div className="animation_bg05 animation_common_bg01"></div>
        <div className="animation_bg06 animation_common_bg02"></div>
        <div className="animation_bg07 animation_common_bg02"></div>
        <div className="animation_bg08 animation_common_bg02"></div>
        <div className="animation_bg09 animation_common_bg02"></div>
        <div className="animation_bg10 animation_common_bg03"></div>
        <div className="animation_bg11 animation_common_bg04"></div>
        <div className="animation_bg12 animation_common_bg03"></div>
        <div className="animation_bg13 animation_common_bg04"></div>
        <div className="animation_bg14 animation_common_bg03"></div>
        <div className="animation_bg15 animation_common_bg04"></div>
        <div className="animation_bg16 animation_common_bg03"></div>
        <div className="animation_bg17 animation_common_bg04"></div>
        <div className="animation_bg18 animation_common_bg05"></div>
        <div className="animation_bg19 animation_common_bg05"></div>
        <div className="animation_bg20 animation_common_bg05"></div>
        <div className="animation_bg21 animation_common_bg05"></div>
        <div className="animation_bg22 animation_common_bg05"></div>
        <div className="animation_bg23 animation_common_bg06"></div>
        <div className="animation_bg24 animation_common_bg06"></div>
        <div className="animation_bg25 animation_common_bg06"></div>
        <div className="animation_bg26 animation_common_bg06"></div>
        <div className="animation_bg27 animation_common_bg07"></div>
        <div className="animation_bg28 animation_common_bg07"></div>
        <div className="animation_bg29 animation_common_bg07"></div>
        <div className="animation_bg30 animation_common_bg07"></div>
        <div className="animation_bg31 animation_common_bg07"></div>
        <div className="animation_bg32 animation_common_bg08"></div>
        <div className="animation_bg33 animation_common_bg08"></div>
        <div className="animation_bg34 animation_common_bg08"></div>
        <div className="animation_bg35 animation_common_bg08"></div>
        <div className="animation_bg36 animation_common_bg09"></div>
        <div className="animation_bg37 animation_common_bg10"></div>
        <div className="animation_bg38 animation_common_bg09"></div>
        <div className="animation_bg39 animation_common_bg10"></div>
        <div className="animation_bg40 animation_common_bg09"></div>
        <div className="animation_bg41 animation_common_bg10"></div>
        <div className="animation_bg42 animation_common_bg09"></div>
        <div className="animation_bg43 animation_common_bg10"></div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;
