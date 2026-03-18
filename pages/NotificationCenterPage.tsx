
import React, { useMemo, useState, useEffect } from 'react';
import { useNotificationState } from '../contexts/NotificationContext';
import { Notification } from '../types';
import InfoIcon from '../components/icons/InfoIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import AlertTriangleIcon from '../components/icons/AlertTriangleIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import ActivityLogIcon from '../components/icons/ActivityLogIcon';
import KeyIcon from '../components/icons/KeyIcon';

const typeStyles = {
    info: { icon: <InfoIcon />, iconColor: 'text-blue-500' },
    success: { icon: <CheckCircleIcon />, iconColor: 'text-green-500' },
    warning: { icon: <AlertTriangleIcon />, iconColor: 'text-yellow-500' },
    error: { icon: <XCircleIcon />, iconColor: 'text-red-500' },
};

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "Just now";
    let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60; if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const TextWithAdminTick: React.FC<{ text: string; fromUser: Notification['fromUser'] }> = ({ text, fromUser }) => {
    if (fromUser?.role === 'admin' && text.includes(fromUser.name)) {
        const parts = text.split(fromUser.name);
        return (
            <>
                {parts[0]}
                <span className="inline-flex items-center gap-1">
                    {fromUser.name}
                    <img src="https://gowthamsportfolio.netlify.app/assets/img/tick.gif" alt="Admin" className="w-3.5 h-3.5" />
                </span>
                {parts.slice(1).join(fromUser.name)}
            </>
        );
    }
    return <>{text}</>;
};

const categoryStyles = {
    activity: {
        unreadBg: 'bg-purple-50 dark:bg-purple-900/20',
        hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
        dotColor: 'bg-purple-500',
    },
    requests: {
        unreadBg: 'bg-amber-50 dark:bg-amber-900/20',
        hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
        dotColor: 'bg-amber-500',
    },
    system: {
        unreadBg: 'bg-sky-50 dark:bg-sky-900/20',
        hoverBg: 'hover:bg-sky-100 dark:hover:bg-sky-900/30',
        dotColor: 'bg-sky-500',
    }
};

const NotificationItem = React.memo<{
    notification: Notification;
    onMarkRead: (id: string) => void;
    onAction: (id: string, actionType: 'accept_friend_request' | 'reject_friend_request' | 'approve_writeup_access' | 'reject_writeup_access') => void;
    category: 'activity' | 'system' | 'requests';
}>(({ notification, onMarkRead, onAction, category }) => {
    const { id, title, message, type = 'info', isRead, timestamp, fromUser, actions } = notification;
    const style = typeStyles[type];
    const catStyle = categoryStyles[category];
    
    const [relativeTime, setRelativeTime] = useState(() => timeAgo(new Date(timestamp)));

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRelativeTime(timeAgo(new Date(timestamp)));
        }, 60000); // Update every minute
        return () => clearInterval(intervalId);
    }, [timestamp]);

    const iconElement = useMemo(() => {
        if (fromUser?.avatar) {
            return (
                 <div className="relative">
                    <img src={fromUser.avatar} alt={fromUser.name} className="w-6 h-6 rounded-full" />
                    {fromUser.role === 'admin' && (
                        <img src="https://gowthamsportfolio.netlify.app/assets/img/tick.gif" alt="Admin" className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full" />
                    )}
                </div>
            );
        }
        
        const Icon = style.icon;
        if (React.isValidElement(Icon)) {
            return React.cloneElement(Icon, { className: `w-5 h-5 ${style.iconColor}` });
        }
        
        return <InfoIcon className={`w-5 h-5 ${style.iconColor}`} />;
    }, [fromUser, style]);
    
    const handleMainClick = () => {
        if (!isRead) {
            onMarkRead(id);
        }
    };

    return (
        <div className={`w-full text-left rounded-lg transition-colors duration-200 ${ isRead ? 'hover:bg-slate-200 dark:hover:bg-slate-700/50' : `${catStyle.unreadBg} ${catStyle.hoverBg}`}`}>
            <div role="button" onClick={handleMainClick} className="flex items-start gap-3 p-3 cursor-pointer">
                <div className="flex-shrink-0 pt-1">
                    {iconElement}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100"><TextWithAdminTick text={title} fromUser={fromUser} /></p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5"><TextWithAdminTick text={message} fromUser={fromUser} /></p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{relativeTime}</p>
                </div>
                {!isRead && (
                    <div className="flex-shrink-0 pt-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${catStyle.dotColor}`}></div>
                    </div>
                )}
            </div>
            {actions && actions.length > 0 && (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-end gap-2 mt-0 p-3 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); onAction(id, action.actionType); }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                action.type === 'primary' 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'
                            }`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

// Define notification categories
const activityTypes: Notification['sourceType'][] = ['like_post', 'comment_post', 'friend_request', 'friend_request_accepted', 'friend_request_rejected'];
const requestTypes: Notification['sourceType'][] = ['writeup_access_request', 'writeup_access_rejected', 'contact_admin_request'];

const NotificationCenterPage: React.FC<{ onNavigateWithinApp?: (path: string) => void; }> = ({ onNavigateWithinApp = () => {} }) => {
    const { notifications, markAsRead, markAllAsRead, clearAll, handleAction } = useNotificationState();
    const [exitingId, setExitingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'activity' | 'system' | 'requests'>('activity');

    // Filter notifications into memoized categories
    const activityNotifications = useMemo(() => notifications.filter(n => activityTypes.includes(n.sourceType)), [notifications]);
    const requestNotifications = useMemo(() => notifications.filter(n => requestTypes.includes(n.sourceType)), [notifications]);
    const systemNotifications = useMemo(() => notifications.filter(n => !activityTypes.includes(n.sourceType) && !requestTypes.includes(n.sourceType)), [notifications]);

    // Calculate unread counts for each category
    const unreadActivity = useMemo(() => activityNotifications.filter(n => !n.isRead).length, [activityNotifications]);
    const unreadRequests = useMemo(() => requestNotifications.filter(n => !n.isRead).length, [requestNotifications]);
    const unreadSystem = useMemo(() => systemNotifications.filter(n => !n.isRead).length, [systemNotifications]);

    const tabs = useMemo(() => [
        { id: 'activity', label: 'Activity', icon: <ActivityLogIcon />, notifications: activityNotifications, unreadCount: unreadActivity },
        { id: 'system', label: 'System', icon: <InfoIcon />, notifications: systemNotifications, unreadCount: unreadSystem },
        { id: 'requests', label: 'Requests', icon: <KeyIcon />, notifications: requestNotifications, unreadCount: unreadRequests },
    ], [activityNotifications, systemNotifications, requestNotifications, unreadActivity, unreadSystem, unreadRequests]);
    
    const activeTabData = tabs.find(t => t.id === activeTab)!;

    const handleItemAction = (notificationId: string, actionType: 'accept_friend_request' | 'reject_friend_request' | 'approve_writeup_access' | 'reject_writeup_access') => {
        if (exitingId) return;
        setExitingId(notificationId);
        setTimeout(() => {
            handleAction(notificationId, actionType);
        }, 300);
    };
    
    useEffect(() => {
        if (exitingId && !notifications.some(n => n.id === exitingId)) {
            setExitingId(null);
        }
    }, [notifications, exitingId]);

    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
            <header className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-base">Notifications</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={markAllAsRead} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed" disabled={notifications.every(n => n.isRead)}>
                            Mark all as read
                        </button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                        <button onClick={clearAll} className="text-xs font-semibold text-red-500 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed" disabled={notifications.length === 0}>
                            Clear All
                        </button>
                    </div>
                </div>
            </header>

             <nav className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 p-2">
                <div className="flex items-center justify-around gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                                activeTab === tab.id
                                    ? 'bg-slate-200 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.unreadCount > 0 && (
                                <span className={`absolute top-1 right-1 h-4 min-w-[1rem] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 ${categoryStyles[tab.id as keyof typeof categoryStyles].dotColor}`}>
                                    {tab.unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto">
                {activeTabData.notifications.length > 0 ? (
                    <div className="p-2 space-y-1">
                        {activeTabData.notifications.map(n => (
                            <div
                                key={n.id}
                                className={`
                                    transition-all duration-300 ease-in-out origin-top
                                    ${exitingId === n.id ? 'max-h-0 opacity-0 scale-y-90' : 'max-h-[40rem] opacity-100 scale-y-100'}
                                `}
                                style={{ overflow: 'hidden' }}
                            >
                                <NotificationItem 
                                    notification={n} 
                                    onMarkRead={markAsRead} 
                                    onAction={handleItemAction} 
                                    category={activeTab}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        <h3 className="font-semibold capitalize">No {activeTab} notifications</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">You're all caught up here.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationCenterPage;
