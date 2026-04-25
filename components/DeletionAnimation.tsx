import React, { useState, useEffect } from 'react';

const LOG_MESSAGES = [
  "INITIATING ACCOUNT DELETION...",
  "CONNECTION TO AUTH_SERVICE: ESTABLISHED",
  "ANONYMIZING USER DATA IN DATABASE... [OK]",
  "PURGING SESSION TOKENS... [OK]",
  "DELETING FIREBASE AUTH RECORD... [OK]",
  "CLEANING UP RESIDUAL DATA... [OK]",
  "ACCOUNT DELETED SUCCESSFULLY.",
  "SYSTEM SHUTDOWN IN 3...",
  "SYSTEM SHUTDOWN IN 2...",
  "SYSTEM SHUTDOWN IN 1...",
  "GOODBYE."
];

const DeletionAnimation: React.FC<{ onAnimationEnd: () => void }> = ({ onAnimationEnd }) => {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let delay = 500;
    LOG_MESSAGES.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleLogs(prev => [...prev, msg]);
      }, delay);
      delay += msg.includes('...') ? 700 : 250;
    });

    setTimeout(() => {
      setIsGlitching(true);
    }, delay + 500);

    setTimeout(() => {
      onAnimationEnd();
    }, delay + 1500);

  }, [onAnimationEnd]);

  return (
    <div className={`deletion-overlay ${isGlitching ? 'glitch-effect' : ''}`}>
      <div className="terminal-logs">
        {visibleLogs.map((log, index) => (
          <p key={index} className="log-entry">{'>'} {log}</p>
        ))}
        {!isGlitching && <span className="blinking-cursor">_</span>}
      </div>
    </div>
  );
};

export default DeletionAnimation;