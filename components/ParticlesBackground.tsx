
import React, { useMemo } from 'react';

const ParticlesBackground: React.FC = () => {
  // Generate particles for the background
  const particles = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 30 + 20}px`, // 20px to 50px
      duration: `${Math.random() * 15 + 10}s`, // 10s to 25s
      delay: `${Math.random() * 10}s`,
      opacity: Math.random() * 0.3 + 0.1
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }} aria-hidden="true">
      <style>{`
        @keyframes rose-float {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.5;
            }
            90% {
                opacity: 0.5;
            }
            100% {
                transform: translateY(-120vh) rotate(360deg);
                opacity: 0;
            }
        }
      `}</style>
      {particles.map(p => (
          <div
              key={p.id}
              className="absolute bottom-[-100px] bg-rose-500/30 dark:bg-rose-500/20 backdrop-blur-[1px]"
              style={{
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  opacity: p.opacity,
                  animation: `rose-float ${p.duration} linear infinite`,
                  animationDelay: p.delay,
                  borderRadius: '0px'
              }}
          />
      ))}
    </div>
  );
};

export default React.memo(ParticlesBackground);
