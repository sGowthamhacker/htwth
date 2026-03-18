import React, { useEffect, useState } from 'react';
import { Notification as NotificationType } from '../types';
import CloseIcon from './icons/CloseIcon';
import InfoIcon from './icons/InfoIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface NotificationProps {
  notification: NotificationType;
  onClose: (id: string) => void;
}

const typeStyles = {
    info: {
        icon: <InfoIcon />,
        iconColor: 'text-blue-500',
        barColor: 'bg-blue-500',
    },
    success: {
        icon: <CheckCircleIcon />,
        iconColor: 'text-green-500',
        barColor: 'bg-green-500',
    },
    warning: {
        icon: <AlertTriangleIcon />,
        iconColor: 'text-yellow-500',
        barColor: 'bg-yellow-500',
    },
    error: {
        icon: <XCircleIcon />,
        iconColor: 'text-red-500',
        barColor: 'bg-red-500',
    },
};

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
    const [exiting, setExiting] = useState(false);
    const { title, message, type = 'info' } = notification;

    const style = typeStyles[type];
    const animationDuration = 400; // in ms

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onClose(notification.id), animationDuration);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
    }, [notification, onClose]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(() => onClose(notification.id), animationDuration);
    };

    const animationStyle = `
        @keyframes slideInFromRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutToRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;

    return (
        <>
            <style>{animationStyle}</style>
            <div
                className="flex items-start w-full max-w-sm bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
                style={{ 
                    animation: exiting 
                        ? `slideOutToRight ${animationDuration}ms ease-in forwards` 
                        : `slideInFromRight ${animationDuration}ms ease-out forwards` 
                }}
            >
                <div className={`w-1.5 self-stretch ${style.barColor}`}></div>
                <div className="flex-1 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            {React.cloneElement(style.icon, { className: `w-6 h-6 ${style.iconColor}` })}
                        </div>
                        <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                onClick={handleClose}
                                className="inline-flex text-gray-400 dark:text-gray-500 rounded-md hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <span className="sr-only">Close</span>
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notification;