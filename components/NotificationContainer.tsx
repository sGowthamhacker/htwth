import React from 'react';
import { useNotificationState } from '../contexts/NotificationContext';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotificationState();

  return (
    <div className="fixed top-4 right-4 z-[10000] w-full max-w-sm space-y-3" style={{
        paddingTop: `var(--desktop-padding-top, 0px)`,
        paddingRight: `var(--desktop-padding-right, 4px)`
    }}>
      {toasts.map(n => (
        <Notification key={n.id} notification={n} onClose={dismissToast} />
      ))}
    </div>
  );
};

export default NotificationContainer;