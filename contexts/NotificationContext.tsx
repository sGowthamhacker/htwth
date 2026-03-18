import React, { createContext, useContext, ReactNode } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  toasts: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  handleAction: (notificationId: string, actionType: 'accept_friend_request' | 'reject_friend_request' | 'approve_writeup_access' | 'reject_writeup_access') => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// The NotificationProvider is now a stateless component that receives its state
// and handlers via the `value` prop from the App component.
interface NotificationProviderProps {
  children: ReactNode;
  value: NotificationContextType;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, value }) => {
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationState = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
      throw new Error('useNotificationState must be used within a NotificationProvider');
    }
    return context;
}
