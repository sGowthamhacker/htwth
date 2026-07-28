import React from 'react';
import { useNotificationState } from '../contexts/NotificationContext';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotificationState();

  return (
    <div 
      className="notification-container fixed top-3 right-3 sm:top-4 sm:right-4 left-auto z-[10000] w-[calc(100vw-1.5rem)] sm:w-full max-w-sm flex flex-col items-end space-y-3 pointer-events-none transform-gpu will-change-transform" 
      style={{
        paddingTop: `calc(var(--desktop-padding-top, 0px) + env(safe-area-inset-top, 0px))`,
        paddingRight: `var(--desktop-padding-right, 0px)`
      }}
    >
      {toasts.map(n => (
        <Notification key={n.id} notification={n} onClose={dismissToast} />
      ))}
    </div>
  );
};

export default NotificationContainer;