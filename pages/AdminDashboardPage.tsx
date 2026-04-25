
import { motion } from 'framer-motion';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { User, ActivityLog, ContactRequest, GlobalNotification } from '../types';
import { useNotificationState } from '../contexts/NotificationContext';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import ActivityLogIcon from '../components/icons/ActivityLogIcon';
import { getCloudinaryUrl } from '../utils/imageService';
import { updateUser, getActivityLog, addActivityLog, deleteActivityLog, clearActivityLog, sendGlobalNotifications, getGlobalSettings, updateGlobalSettings, subscribeToGlobalSettings, subscribeToActivityLog, subscribeToUsers, getPosts, getContactRequests, updateContactRequestStatus } from '../services/database';
import MailIcon from '../components/icons/MailIcon';
import UsersIcon from '../components/icons/UsersIcon';
import KeyIcon from '../components/icons/KeyIcon';
import PencilIcon from '../components/icons/PencilIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import RefreshIcon from '../components/icons/RefreshIcon';
import TrashIcon from '../components/icons/TrashIcon';
import PaperAirplaneIcon from '../components/icons/PaperAirplaneIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import SearchIcon from '../components/icons/SearchIcon';
import CheckIcon from '../components/icons/CheckIcon';
import ShieldIcon from '../components/icons/ShieldIcon';
import MenuIcon from '../components/icons/MenuIcon';
import AdminIcon from '../components/icons/AdminIcon';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import ParticlesBackground from '../components/ParticlesBackground';
import { EMAIL_TEMPLATES, EmailTemplate } from '../utils/emailTemplates';
import DOMPurify from 'dompurify';

// EyeIcon for Permissions dropdown
const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const MessageSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);


type UserFilter = 'pending' | 'verified' | 'unverified' | null;

const StatCard: React.FC<{ title: string; value: string | number; color: string; icon: React.ReactNode; onClick: () => void; isActive: boolean; }> = ({ title, value, color, icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`relative w-full text-left p-4 sm:p-6 rounded-2xl transition-all duration-300 overflow-hidden group ${
            isActive 
                ? `bg-white dark:bg-slate-800 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 shadow-xl scale-[1.02]` 
                : 'bg-white dark:bg-slate-800 hover:shadow-lg hover:-translate-y-1 border border-slate-100 dark:border-slate-700/50'
        }`}
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')}`}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-16 h-16' })}
        </div>
        <div className="relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color} bg-opacity-20 text-current shadow-sm`}>
                {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
            </div>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{value}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{title}</p>
        </div>
    </button>
);

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

// New Component for modern permissions dropdown
const PermissionDropdown: React.FC<{
    currentAccess: 'none' | 'read' | 'write';
    onChange: (access: 'none' | 'read' | 'write') => void;
}> = ({ currentAccess, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const accessConfig = {
        'none': { label: 'None', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: <XCircleIcon className="w-3.5 h-3.5" /> },
        'read': { label: 'Read', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', icon: <EyeIcon className="w-3.5 h-3.5" /> },
        'write': { label: 'Write', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: <PencilIcon className="w-3.5 h-3.5" /> }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (access: 'none' | 'read' | 'write') => {
        onChange(access);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block w-full" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`w-full flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-600 ${accessConfig[currentAccess].color}`}
            >
                {accessConfig[currentAccess].icon}
                <span>{accessConfig[currentAccess].label}</span>
            </button>
            {isOpen && (
                <div className="absolute left-0 z-20 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in py-1 overflow-hidden">
                    {(Object.keys(accessConfig) as Array<'none' | 'read' | 'write'>).map(access => (
                        <button
                            key={access}
                            onClick={() => handleSelect(access)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors ${currentAccess === access ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            {React.cloneElement(accessConfig[access].icon, {className: 'w-4 h-4 opacity-70'})}
                            <span>{accessConfig[access].label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};



function getRecipients(mode: string, allUsers: User[], selectedUsers: User[]) {
    return mode === 'all' ? allUsers.filter(u => u.role !== 'admin') :
           mode === 'verified' ? allUsers.filter(u => u.role !== 'admin' && u.status === 'verified') :
           mode === 'unverified' ? allUsers.filter(u => u.role !== 'admin' && u.status === 'unverified') :
           mode === 'pending' ? allUsers.filter(u => u.role !== 'admin' && u.status === 'pending') :
           selectedUsers;
}

const BroadcastChannel: React.FC<{ adminUser: User; allUsers: User[] }> = ({ adminUser, allUsers }) => {
    const [mode, setMode] = useState<'all' | 'specific' | 'verified' | 'unverified' | 'pending'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationState();
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const broadcastRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (broadcastRef.current && !broadcastRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            addNotification({ title: 'Error', message: 'Subject and message content cannot be empty.', type: 'error' });
            return;
        }

        setIsLoading(true);

        const fromPayload = {
            email: adminUser.email,
            name: adminUser.name,
            avatar: adminUser.avatar,
            role: adminUser.role,
        };

        const filteredUsers = getRecipients(mode, allUsers, selectedUsers);

        let notificationsToSend: GlobalNotification[] = filteredUsers.map(u => ({
            id: crypto.randomUUID(),
            to: u.email,
            from: fromPayload,
            type: 'admin_message',
            title,
            message,
        }));
        
        if (notificationsToSend.length === 0) {
            addNotification({ title: 'Info', message: 'No users to send the message to.', type: 'info' });
            setIsLoading(false);
            return;
        }

        const success = await sendGlobalNotifications(notificationsToSend);
        setIsLoading(false);

        if (success) {
            addNotification({ title: 'Broadcast Sent', message: `Communique dispatched to ${notificationsToSend.length} user(s).`, type: 'success' });
            setTitle('');
            setMessage('');
            setSearchQuery('');
            setSelectedUsers([]);
        } else {
            addNotification({ title: 'Broadcast Failed', message: 'Transmission failed. Please try again.', type: 'error' });
        }
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim()) {
            const filteredUsers = allUsers.filter(user =>
                user.role !== 'admin' &&
                !selectedUsers.some(selected => selected.id === user.id) &&
                (user.name.toLowerCase().includes(value.toLowerCase()) ||
                 user.email.toLowerCase().includes(value.toLowerCase()))
            );
            setSuggestions(filteredUsers.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (user: User) => {
        if (!selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchQuery('');
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    return (
        <div ref={broadcastRef} className="space-y-8 animate-fade-in" key="broadcast">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Panel: Settings & Preview */}
                <div className="lg:w-1/3 space-y-6">
                    {/* Audience Selector Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 z-20 relative">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Transmission Scope</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => setMode('all')}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group ${
                                    mode === 'all' 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-400 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                <div className={`p-3 rounded-full ${mode === 'all' ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Global Broadcast</div>
                                    <div className={`text-xs mt-0.5 ${mode === 'all' ? 'text-indigo-100' : 'text-slate-400'}`}>All registered users</div>
                                </div>
                                {mode === 'all' && <div className="absolute right-4 top-1/2 -translate-y-1/2"><CheckIcon className="w-5 h-5"/></div>}
                            </button>
                            
                            <button 
                                onClick={() => setMode('specific')}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group ${
                                    mode === 'specific' 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-400 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                <div className={`p-3 rounded-full ${mode === 'specific' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                                    <MailIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Direct Line</div>
                                    <div className={`text-xs mt-0.5 ${mode === 'specific' ? 'text-emerald-100' : 'text-slate-400'}`}>Specific recipient(s)</div>
                                </div>
                                {mode === 'specific' && <div className="absolute right-4 top-1/2 -translate-y-1/2"><CheckIcon className="w-5 h-5"/></div>}
                            </button>
                        </div>
                        
                        {/* Conditional Recipient Input */}
                        <div className={`transition-all duration-300 ease-in-out ${mode === 'specific' ? 'max-h-[500px] opacity-100 mt-4 overflow-visible' : 'max-h-0 opacity-0 mt-0 overflow-hidden'}`}>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Recipients</label>
                            
                            {/* Selected Chips */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedUsers.map(u => (
                                        <div key={u.id} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-2 py-1 rounded-full animate-fade-in">
                                            <img src={getCloudinaryUrl(u.avatar, { width: 20, height: 20, radius: 'max' })} alt={u.name} className="w-5 h-5 rounded-full" />
                                            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200 max-w-[100px] truncate">{u.name}</span>
                                            <button 
                                                onClick={() => handleRemoveUser(u.id)}
                                                className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700 text-indigo-500 hover:text-indigo-800 dark:text-indigo-300 transition-colors"
                                            >
                                                <XCircleIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={handleSearchChange}
                                    placeholder="Search to add users..."
                                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 pl-10 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white"
                                    autoComplete="off"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <SearchIcon className="w-4 h-4" />
                                </div>
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-slide-up max-h-60 overflow-y-auto custom-scrollbar">
                                        {suggestions.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuggestionClick(user); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 group"
                                            >
                                                <img src={getCloudinaryUrl(user.avatar, { width: 32, height: 32, radius: 'max' })} alt={user.name} className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 z-10 relative">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Preview
                        </h3>
                        {/* Mock Notification */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border-l-4 border-blue-500 p-4 relative overflow-hidden">
                            <div className="flex items-start gap-3 relative z-10">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 overflow-hidden shadow-sm">
                                        <img src={adminUser.avatar} alt="Admin" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{adminUser.name}</span>
                                        <img src="https://gowthamsportfolio.netlify.app/assets/img/tick.gif" className="w-3.5 h-3.5" alt="Verified" />
                                        <span className="text-xs text-slate-400 ml-auto">Now</span>
                                    </div>
                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate pr-4">{title || "Subject Line"}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{message || "Message content will appear here..."}</p>
                                </div>
                            </div>
                            {/* Decorative BG Element */}
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Composition */}
                <div className="lg:w-2/3 flex flex-col h-full min-h-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden z-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="p-8 md:p-10 flex-1 flex flex-col">
                        <h2 className="text-xl font-serif font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-4">
                            <span>Communique Details</span>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        </h2>
                        
                        <div className="space-y-8 flex-1">
                            <div className="group">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 transition-colors group-focus-within:text-indigo-600">Subject</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="w-full text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none py-2 placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors"
                                    placeholder="Enter Subject..."
                                />
                            </div>

                            <div className="flex-1 flex flex-col group h-full">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 transition-colors group-focus-within:text-indigo-600">Message Body</label>
                                <textarea 
                                    value={message} 
                                    onChange={e => setMessage(e.target.value)} 
                                    className="flex-1 w-full bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 resize-none border-0 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 outline-none transition-all"
                                    placeholder="Type your official message here..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="text-xs text-slate-400 mr-6 italic font-serif">
                                 Authorized by: {adminUser.name}
                             </div>
                            <button 
                                onClick={handleSend} 
                                disabled={isLoading} 
                                className="relative overflow-hidden group bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <PaperAirplaneIcon className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    <span>Transmit Message</span>
                                </span>
                                <div className="absolute inset-0 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MailBroadcastChannel: React.FC<{ adminUser: User; allUsers: User[] }> = ({ adminUser, allUsers }) => {
    const [mode, setMode] = useState<'all' | 'specific' | 'verified' | 'unverified' | 'pending'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [removedUserIds, setRemovedUserIds] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [smtpStatus, setSmtpStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
    const { addNotification } = useNotificationState();
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const broadcastRef = useRef<HTMLDivElement>(null);

    const applyTemplate = async (templateId: string) => {
        const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            let finalBody = template.body;
            
            // Handle dynamic content injection with proper HTML spacing and blocks
            if (template.body.includes('[POST_LIST]')) {
                const posts = await getPosts('writeup');
                const recentPosts = posts.slice(0, 3);
                const postListStr = recentPosts.length > 0 
                  ? recentPosts.map(p => `
                    <div style="margin-bottom: 20px; padding: 12px; background-color: #1e293b; border-radius: 8px; border: 1px solid #334155;">
                        <div style="color: #f8fafc; font-weight: bold; font-size: 14px; margin-bottom: 6px;">📍 ${p.title}</div>
                        <a href="${window.location.origin}/#/writeup/${p.id}" style="color: #4f46e5; text-decoration: none; font-size: 12px; font-weight: bold;">🔗 Click to View Report</a>
                    </div>
                  `).join('')
                  : '<div style="color: #94a3b8; font-style: italic;">No recent writeups found.</div>';
                finalBody = finalBody.replace('[POST_LIST]', postListStr);
            }
            
            if (template.body.includes('[BLOG_LIST]')) {
                const blogs = await getPosts('blog');
                const recentBlogs = blogs.slice(0, 3);
                const blogListStr = recentBlogs.length > 0 
                  ? recentBlogs.map(b => `
                    <div style="margin-bottom: 20px; padding: 12px; background-color: #1e293b; border-radius: 8px; border: 1px solid #334155;">
                        <div style="color: #f8fafc; font-weight: bold; font-size: 14px; margin-bottom: 6px;">✍️ ${b.title}</div>
                        <a href="${window.location.origin}/#/blog/${b.id}" style="color: #4f46e5; text-decoration: none; font-size: 12px; font-weight: bold;">🔗 Read Full Blog</a>
                    </div>
                  `).join('')
                  : '<div style="color: #94a3b8; font-style: italic;">No recent blog posts found.</div>';
                finalBody = finalBody.replace('[BLOG_LIST]', blogListStr);
            }

            setTitle(template.subject);
            setMessage(finalBody);
            setSelectedTemplate(templateId);
            addNotification({ title: 'Template Applied', message: `${template.name} loaded with live data.`, type: 'info' });
        }
    };

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            addNotification({ title: 'Error', message: 'Subject and message content cannot be empty.', type: 'error' });
            return;
        }

        setIsLoading(true);

        const recipients = getRecipients(mode, allUsers, selectedUsers)
            .filter(u => !removedUserIds.includes(u.id))
            .map(u => u.email);

        if (recipients.length === 0) {
            addNotification({ title: 'Error', message: 'No recipients selected.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: recipients,
                    subject: title,
                    body: message
                })
            });

            const data = await response.json();

            if (response.ok) {
                addNotification({ title: 'Email Sent', message: `Updates sent to ${recipients.length} user(s) via Gmail SMTP.`, type: 'success' });
                setTitle('');
                setMessage('');
                setSelectedUsers([]);
            } else {
                addNotification({ title: 'Error', message: data.error || 'Failed to send emails.', type: 'error' });
            }
        } catch (error) {
            addNotification({ title: 'Error', message: 'An error occurred while connecting to the mail server.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setSmtpStatus('unknown');
        try {
            const response = await fetch('/api/admin/test-smtp');
            const data = await response.json();
            if (response.ok) {
                setSmtpStatus('success');
                addNotification({ title: 'Success', message: 'SMTP connection verified successfully.', type: 'success' });
            } else {
                setSmtpStatus('error');
                addNotification({ title: 'SMTP Error', message: data.error || 'Failed to connect to SMTP server.', type: 'error' });
            }
        } catch (error) {
            setSmtpStatus('error');
            addNotification({ title: 'Error', message: 'Failed to reach backend server.', type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim()) {
            const filtered = allUsers.filter(u => 
                u.role !== 'admin' && 
                !selectedUsers.some(s => s.id === u.id) &&
                (u.name.toLowerCase().includes(value.toLowerCase()) || u.email.toLowerCase().includes(value.toLowerCase()))
            );
            setSuggestions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={broadcastRef} className="space-y-8 animate-fade-in" key="mail-broadcast">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">SMTP Delivery Scope</h3>
                        <div className="space-y-3">
                            <button onClick={() => setMode('all')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${mode === 'all' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                <UsersIcon className="w-5 h-5" />
                                <div className="text-left"><div className="font-bold text-sm">All Registered</div><div className="text-[10px] opacity-70">Send to entire userbase</div></div>
                            </button>
                            <button onClick={() => setMode('verified')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${mode === 'verified' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                <UsersIcon className="w-5 h-5" />
                                <div className="text-left"><div className="font-bold text-sm">Verified Users</div><div className="text-[10px] opacity-70">Send to verified members</div></div>
                            </button>
                            <button onClick={() => setMode('unverified')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${mode === 'unverified' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                <UsersIcon className="w-5 h-5" />
                                <div className="text-left"><div className="font-bold text-sm">Unverified Users</div><div className="text-[10px] opacity-70">Send to unverified members</div></div>
                            </button>
                            <button onClick={() => setMode('pending')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${mode === 'pending' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                <UsersIcon className="w-5 h-5" />
                                <div className="text-left"><div className="font-bold text-sm">Pending Verification</div><div className="text-[10px] opacity-70">Users awaiting approval</div></div>
                            </button>
                            <button onClick={() => setMode('specific')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${mode === 'specific' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                <MailIcon className="w-5 h-5" />
                                <div className="text-left"><div className="font-bold text-sm">Targeted Users</div><div className="text-[10px] opacity-70">Pick specific emails</div></div>
                            </button>
                        </div>
                        {mode !== 'specific' && (
                            <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                {(() => {
                                    const filteredRecipients = getRecipients(mode, allUsers, selectedUsers).filter(u => !removedUserIds.includes(u.id));
                                    return (
                                        <>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Recipients Preview ({filteredRecipients.length} Users)</h4>
                                            <div className="max-h-40 overflow-y-auto space-y-1">
                                                {filteredRecipients.slice(0, 50).map(u => (
                                                    <div key={u.id} className="text-[11px] text-slate-600 dark:text-slate-300 truncate flex items-center justify-between group">
                                                        <span>{u.name} — <span className="font-mono text-slate-400">{u.email}</span></span>
                                                        <button onClick={() => setRemovedUserIds(prev => [...prev, u.id])} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700">
                                                            <XCircleIcon className="w-3.5 h-3.5"/>
                                                        </button>
                                                    </div>
                                                ))}
                                                {filteredRecipients.length > 50 && (
                                                    <div className="text-[10px] text-slate-400 pt-1">+ {filteredRecipients.length - 50} more</div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                        {mode === 'specific' && (
                            <div className="mt-4 space-y-4">
                                <div className="flex flex-wrap gap-1">
                                    {selectedUsers.map(u => (
                                        <div key={u.id} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md text-[10px] flex items-center gap-1">
                                            {u.email}
                                            <button onClick={() => setSelectedUsers(prev => prev.filter(x => x.id !== u.id))}><XCircleIcon className="w-3 h-3"/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search users..." className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg mt-1 z-50 overflow-hidden">
                                            {suggestions.map(u => (
                                                <button key={u.id} onClick={() => { setSelectedUsers([...selectedUsers, u]); setSearchQuery(''); setShowSuggestions(false); }} className="w-full p-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0">{u.name} ({u.email})</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                            Mail Templates
                            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded-full">10 AVAILABLE</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                             {EMAIL_TEMPLATES.map(t => (
                                 <button 
                                    key={t.id}
                                    onClick={() => applyTemplate(t.id)}
                                    className={`text-[10px] p-2 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                                        selectedTemplate === t.id 
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500' 
                                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300 text-slate-500 dark:text-slate-400'
                                    }`}
                                 >
                                     <span className="font-bold uppercase tracking-tighter opacity-60">{t.category}</span>
                                     <span className="font-semibold truncate">{t.name}</span>
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><RefreshIcon className="w-3 h-3" /> SMTP SERVER STATUS</div>
                            <button 
                                onClick={handleTestConnection}
                                disabled={isTesting}
                                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 disabled:opacity-50"
                            >
                                {isTesting ? 'TESTING...' : 'RE-TEST'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">GMAIL_SMTP:v587</span>
                            <span className={`text-[10px] font-bold ${
                                smtpStatus === 'success' ? 'text-green-500' : 
                                smtpStatus === 'error' ? 'text-red-500' : 
                                'text-amber-500'
                            }`}>
                                {smtpStatus === 'success' ? 'OPERATIONAL' : 
                                 smtpStatus === 'error' ? 'CONNECTION FAILED' : 
                                 'NOT TESTED'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="lg:w-2/3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-8 flex-1 flex flex-col">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Internal Update Dispatcher</h2>
                        <div className="space-y-6 flex-1 flex flex-col">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Subject Line</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="System Update: v1.0.x is now live!" className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-2 text-lg font-bold outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email Content (HTML Supported)</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter the update details for your users..." className="flex-1 w-full bg-slate-50 dark:bg-slate-800/20 rounded-xl p-4 text-sm resize-none outline-none focus:ring-1 focus:ring-indigo-500 min-h-[150px]" />
                            </div>

                            {/* Live Email Preview */}
                            <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Live Preview (What users see)</label>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-[600px] shadow-sm text-left font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif] text-[15px] leading-relaxed text-[#333] p-8 mx-0">
                                    
                                    <div className="whitespace-pre-wrap mb-8 text-[#333333]" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message || 'Your email content will appear here...') }}>
                                    </div>
                                    
                                    <div className="mt-10">
                                        <div className="font-size-[15px] text-[#333333] mb-4">Best regards,</div>
                                        <div className="font-bold text-[#111111] text-[15px] mb-0.5">
                                            {adminUser.name || 'Gowtham'}
                                        </div>
                                        <div className="text-[#555555] text-[14px] mb-3">
                                            Security Research Hub
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <img src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" className="w-7 h-7 rounded-[4px] block" alt="Logo" />
                                            <div className="font-[800] text-[18px] text-[#0f172a] -tracking-[0.5px] mt-0.5">
                                                HTWTH
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100">
                                            <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-4">
                                                Connect with Me
                                            </div>
                                            <div className="flex gap-3 mb-6">
                                                <img src="https://img.icons8.com/color/96/instagram-new.png" className="w-6 h-6 inline-block" alt="IG" />
                                                <img src="https://img.icons8.com/color/96/twitterx--v1.png" className="w-6 h-6 inline-block" alt="X" />
                                                <img src="https://img.icons8.com/color/96/linkedin.png" className="w-6 h-6 inline-block" alt="LI" />
                                                <img src="https://img.icons8.com/color/96/whatsapp.png" className="w-6 h-6 inline-block" alt="WA" />
                                                <img src="https://img.icons8.com/color/96/gmail-new.png" className="w-6 h-6 inline-block" alt="Mail" />
                                            </div>
                                            
                                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6 font-sans">
                                                <div className="text-slate-500 text-[11px] leading-relaxed">
                                                    <b className="text-indigo-600 font-bold uppercase">CAUTION - ENCRYPTED COMMUNICATION:</b> This report contains proprietary security intelligence. Unauthorized distribution is strictly monitored.
                                                </div>
                                            </div>
                                            
                                            <div className="text-slate-400 text-[9px] font-bold uppercase tracking-widest font-sans">
                                                &copy; {new Date().getFullYear()} HackToWriteToHack | ALL RIGHTS RESERVED
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all disabled:opacity-50">
                                {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <PaperAirplaneIcon className="w-4 h-4" />}
                                Send Email Campaign
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// AdminNav Component - Updated for Classic Mobile Hamburger Menu
const AdminNav: React.FC<{
    currentView: string;
    onNavigate: (view: string) => void;
    requestsCount: number;
    inquiriesCount: number;
    liveCount: number;
}> = ({ currentView, onNavigate, requestsCount, inquiriesCount, liveCount }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { id: 'management', label: 'User Management', icon: <UsersIcon className="w-5 h-5"/> },
        { 
            id: 'requests', 
            label: 'Requests', 
            icon: <MailIcon className="w-5 h-5"/>, 
            count: requestsCount, 
            countColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' 
        },
        {
            id: 'inquiries',
            label: 'Inquiries',
            icon: <MessageSquareIcon className="w-5 h-5" />,
            count: inquiriesCount,
            countColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
        },
        { 
            id: 'live', 
            label: 'Live Activity', 
            icon: <ActivityLogIcon className="w-5 h-5"/>, 
            count: liveCount, 
            countColor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' 
        },
        { id: 'broadcast', label: 'Broadcast Channel', icon: <PaperAirplaneIcon className="w-5 h-5"/> },
        { id: 'controller', label: 'Controller', icon: <ShieldIcon className="w-5 h-5"/> }
    ];

    // Identify active item for mobile header display
    const currentItem = navItems.find(item => item.id === currentView) || navItems[0];

    const handleNavClick = (viewId: string) => {
        onNavigate(`admin/${viewId}`);
        setIsMenuOpen(false);
    };

    // Close menu when view changes externally
    useEffect(() => {
        setIsMenuOpen(false);
    }, [currentView]);

    return (
        <div className="relative border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent rounded-t-xl md:rounded-none z-20">
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden flex items-center justify-between p-4">
                <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-100">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        {currentItem.icon}
                    </span>
                    <span>{currentItem.label}</span>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Toggle Menu"
                >
                    {isMenuOpen ? <XCircleIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Dropdown Menu (Classic Style) */}
            {isMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] md:hidden" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(false);
                        }}
                    />
                    <div className="md:hidden absolute top-full left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-xl animate-slide-down-and-fade rounded-b-xl overflow-hidden">
                        <nav className="flex flex-col p-2 space-y-1">
                            {navItems.map(item => {
                                const isActive = currentView === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                                {item.icon}
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                        {item.count !== undefined && item.count > 0 && (
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.countColor}`}>
                                                {item.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </>
            )}

            {/* Desktop Tabs (Unchanged) */}
            <nav className="hidden md:flex -mb-px space-x-6 overflow-x-auto hide-scrollbar" aria-label="Tabs">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(`admin/${item.id}`)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                            currentView === item.id
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                        }`}
                    >
                        {item.icon}
                        {item.label}
                        {item.count !== undefined && item.count > 0 && (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.countColor}`}>
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

interface AdminDashboardPageProps {
    allUsers: User[];
    setAllUsers: (updater: (currentUsers: User[]) => User[]) => void;
    user: User;
    onApproveWriteupAccess: (requestor: { email: string; name: string; }) => Promise<void>;
    onRejectWriteupAccess: (requestor: { email: string; name: string; }) => Promise<void>;
    deepLinkInfo?: string | null;
    onNavigateWithinApp?: (path: string) => void;
    liveUsers: any[];
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ allUsers, setAllUsers, user, onApproveWriteupAccess, onRejectWriteupAccess, deepLinkInfo, onNavigateWithinApp = (path: string) => {}, liveUsers }) => {
    // Security check: only admins can access this page
    if (!user || user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
                    <p className="text-slate-600 dark:text-slate-400">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    const [view, setView] = useState<'management' | 'live' | 'requests' | 'inquiries' | 'broadcast' | 'mail_broadcast' | 'controller'>('management');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'created_at' | 'name'>('created_at');
    const [activeFilter, setActiveFilter] = useState<UserFilter>('pending');
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [isClearLogModalOpen, setIsClearLogModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const { addNotification } = useNotificationState();
    
    const [resetUser, setResetUser] = useState<User | null>(null);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [isWelcomeAnimationEnabled, setIsWelcomeAnimationEnabled] = useState(true);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('System maintenance in progress. Please check back later.');
    const [maintenanceStartTime, setMaintenanceStartTime] = useState('');
    const [maintenanceEndTime, setMaintenanceEndTime] = useState('');

    const toLocalDatetimeString = (isoString: string | null | undefined) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return '';
            const tzOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
        } catch (e) {
            return '';
        }
    };

    const toISOString = (localString: string): string | null => {
        if (!localString) return null;
        try {
            const date = new Date(localString);
            if (isNaN(date.getTime())) return null;
            return date.toISOString();
        } catch (e) {
            return null;
        }
    };
    
    const memberEmails = useMemo(() => new Set(allUsers.map(u => u.email)), [allUsers]);

    // Create a ref for allUsers to access inside the static useEffect listener
    const allUsersRef = useRef(allUsers);
    useEffect(() => {
        allUsersRef.current = allUsers;
    }, [allUsers]);

    const isMaintenanceActive = (settings: { isMaintenanceMode: boolean; maintenanceStartTime?: string | null; maintenanceEndTime?: string | null }) => {
        if (!settings || !settings.isMaintenanceMode) return false;
        const now = new Date();
        const start = settings.maintenanceStartTime ? new Date(settings.maintenanceStartTime) : null;
        const end = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
        const isStartValid = start && !isNaN(start.getTime());
        const isEndValid = end && !isNaN(end.getTime());
        
        // If no valid timing is set but the master toggle is ON, maintenance is active immediately
        if (!isStartValid && !isEndValid) return true;
        
        // If timing is set, it MUST be met
        if (isStartValid && isEndValid) {
            return now >= start && now <= end;
        }
        if (isStartValid) {
            return now >= start;
        }
        if (isEndValid) {
            return now <= end;
        }
        
        return false; // Should not reach here if logic is sound
    };

    const notifyUsersOfMaintenance = async (isArmed: boolean, message: string, start?: string | null, end?: string | null) => {
        if (!isArmed) return;
        
        const notifications: GlobalNotification[] = allUsers.map(user => ({
            to: user.email,
            from: 'System Admin',
            type: 'system',
            title: 'Maintenance Scheduled',
            message: `System maintenance is scheduled. ${message} ${start ? `Starts: ${new Date(start).toLocaleString()}` : ''} ${end ? `Estimated Return: ${new Date(end).toLocaleString()}` : ''}`,
            targetId: 'maintenance',
            targetType: 'system'
        }));

        try {
            await sendGlobalNotifications(notifications);
            addNotification({ title: 'Notifications Sent', message: `All ${allUsers.length} users have been notified.`, type: 'success' });
        } catch (error) {
            console.error("Failed to send maintenance notifications", error);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getGlobalSettings();
            if (settings) {
                setIsWelcomeAnimationEnabled(settings.isWelcomeAnimationEnabled);
                setIsMaintenanceMode(settings.isMaintenanceMode);
                setMaintenanceMessage(settings.maintenanceMessage);
                setMaintenanceStartTime(toLocalDatetimeString(settings.maintenanceStartTime || null));
                setMaintenanceEndTime(toLocalDatetimeString(settings.maintenanceEndTime || null));
            }
        };
        fetchSettings();

        const unsubscribe = subscribeToGlobalSettings((settings) => {
            if (settings) {
                setIsWelcomeAnimationEnabled(settings.isWelcomeAnimationEnabled);
                setIsMaintenanceMode(settings.isMaintenanceMode);
                setMaintenanceMessage(settings.maintenanceMessage);
                setMaintenanceStartTime(toLocalDatetimeString(settings.maintenanceStartTime || null));
                setMaintenanceEndTime(toLocalDatetimeString(settings.maintenanceEndTime || null));
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setView((deepLinkInfo as 'management' | 'live' | 'requests' | 'inquiries' | 'broadcast' | 'mail_broadcast' | 'controller') || 'management');
        // Close mobile menu on view change
        setIsMobileMenuOpen(false);
    }, [deepLinkInfo]);

    useEffect(() => {
        const fetchLog = async () => {
            const logs = await getActivityLog(50);
            setActivityLog(logs);
        };
        fetchLog();
    }, []);
    
    const writeupAccessRequests = useMemo(() => allUsers.filter(u => u.has_requested_writeup_access), [allUsers]);
    const requestsCount = writeupAccessRequests.length;

    const navItems = [
        { id: 'management', label: 'User Management', icon: <UsersIcon className="w-5 h-5"/> },
        { 
            id: 'requests', 
            label: 'Requests', 
            icon: <MailIcon className="w-5 h-5"/>, 
            count: requestsCount, 
            countColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' 
        },
        {
            id: 'inquiries',
            label: 'Inquiries',
            icon: <MessageSquareIcon className="w-5 h-5" />,
            count: contactRequests.length,
            countColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
        },
        { 
            id: 'live', 
            label: 'Live Activity', 
            icon: <ActivityLogIcon className="w-5 h-5"/>, 
            count: liveUsers.length, 
            countColor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' 
        },
        { id: 'broadcast', label: 'Broadcast Channel', icon: <PaperAirplaneIcon className="w-5 h-5"/> },
        { id: 'mail_broadcast', label: 'Mail Update', icon: <MailIcon className="w-5 h-5"/> },
        { id: 'controller', label: 'Controller', icon: <ShieldIcon className="w-5 h-5"/> }
    ];

    useEffect(() => {
        // Load initial data
        getContactRequests().then(reqs => setContactRequests(reqs.filter(r => !r.handled)));

        const unsubscribe = subscribeToActivityLog((newLog) => {
            setActivityLog(prev => [newLog, ...prev].slice(0, 100)); // Keep top 100
        });
        
        const unsubscribeUsers = subscribeToUsers((updatedUser) => {
            setAllUsers(prev => {
                // If it's a new user, add it. If it exists, update it.
                const exists = prev.find(u => u.id === updatedUser.id);
                if (exists) {
                    return prev.map(u => u.id === updatedUser.id ? updatedUser : u);
                }
                return [...prev, updatedUser];
            });
        });

        return () => {
            unsubscribe();
            unsubscribeUsers();
        };
    }, []);

    const logAdminActivity = (action: string, target?: string) => {
        addActivityLog(user.id, action, target).then(async () => {
            // Realtime listener will handle the update
        });
    };
    
    const handleMarkAsHandled = useCallback(async (requestId: string) => {
        try {
            const success = await updateContactRequestStatus(requestId, true);
            if (success) {
                setContactRequests(prev => prev.filter(req => req.id !== requestId));
                addNotification({ title: "Success", message: "Request marked as handled.", type: 'success' });
                logAdminActivity('handled support inquiry', requestId);
            }
        } catch (error) {
            addNotification({ title: "Error", message: "Failed to mark as handled.", type: 'error' });
        }
    }, [addNotification]);


    const stats = useMemo(() => ({
        pending: allUsers.filter(u => u.status === 'pending' && !u.email.startsWith('deleted-user-')).length,
        verified: allUsers.filter(u => u.status === 'verified' && !u.email.startsWith('deleted-user-')).length,
        unverified: allUsers.filter(u => u.status === 'unverified' && !u.email.startsWith('deleted-user-')).length,
    }), [allUsers]);

    const filteredAndSortedUsers = useMemo(() => {
        let users = [...allUsers].filter(u => 
            u.email !== 'system@local' && 
            u.role !== 'admin' &&
            !u.email.startsWith('deleted-user-')
        );

        if (activeFilter) {
            users = users.filter(u => u.status === activeFilter);
        }
        
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            users = users.filter(u => u.name.toLowerCase().includes(lowercasedQuery) || u.email.toLowerCase().includes(lowercasedQuery));
        }
        
        users.sort((a, b) => {
            if (sortBy === 'created_at') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return a.name.localeCompare(b.name);
        });
        
        return users;
    }, [allUsers, searchQuery, sortBy, activeFilter]);
    
    const handleFilterClick = (filter: UserFilter) => {
        setActiveFilter(prev => (prev === filter ? null : filter));
    };

    const handleApprove = async (targetUser: User) => {
        const updates: Partial<User> = { status: 'verified', admin_verified: true, writeup_access: 'write', doc_access: true };
        const updatedUser = await updateUser(targetUser.email, updates);
        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.email === targetUser.email ? updatedUser : u));
            addNotification({ title: 'User Approved', message: `Access granted for ${targetUser.email}.`, type: 'success' });
            logAdminActivity('approved user', targetUser.name);
        } else {
            addNotification({ title: 'Error', message: 'Could not approve user.', type: 'error' });
        }
    };

    const handleReject = async (targetUser: User) => {
        const updates: Partial<User> = { status: 'unverified', admin_verified: false, verified_at: null, writeup_access: 'none', doc_access: false };
        const updatedUser = await updateUser(targetUser.email, updates);
        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.email === targetUser.email ? updatedUser : u));
            addNotification({ title: 'User Rejected', message: `${targetUser.email} has been moved to unverified.`, type: 'warning' });
            logAdminActivity('rejected user', targetUser.name);
        } else {
            addNotification({ title: 'Error', message: 'Could not reject user.', type: 'error' });
        }
    };
    
    const handleRevoke = async (targetUser: User) => {
        const updates: Partial<User> = { status: 'pending', admin_verified: false, writeup_access: 'none', doc_access: false };
        const updatedUser = await updateUser(targetUser.email, updates);
        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.email === targetUser.email ? updatedUser : u));
            addNotification({ title: 'Access Revoked', message: `Access for ${targetUser.email} has been revoked. They are now pending.`, type: 'info' });
            logAdminActivity('revoked access for', targetUser.name);
        } else {
            addNotification({ title: 'Error', message: 'Could not revoke access.', type: 'error' });
        }
    };

    const handleWriteupAccessChange = async (targetUser: User, access: 'none' | 'read' | 'write') => {
        const updates: Partial<User> = { writeup_access: access };
        const updatedUser = await updateUser(targetUser.email, updates);
        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.email === targetUser.email ? updatedUser : u));
            addNotification({ title: 'Permission Updated', message: `Writeup access for ${targetUser.email} set to "${access}".`, type: 'info' });
            logAdminActivity(`set writeup access to "${access}" for`, targetUser.name);
        } else {
            addNotification({ title: 'Error', message: 'Could not update permission.', type: 'error' });
        }
    };

    const handleDocAccessChange = async (targetUser: User) => {
        const newAccess = !(targetUser.doc_access ?? false);
        const updates: Partial<User> = { doc_access: newAccess };
        const updatedUser = await updateUser(targetUser.email, updates);

        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.email === targetUser.email ? updatedUser : u));
            addNotification({ title: 'Permission Updated', message: `Doc access for ${targetUser.email} has been ${newAccess ? 'granted' : 'revoked'}.`, type: 'info' });
            logAdminActivity(`${newAccess ? 'granted' : 'revoked'} doc access for`, targetUser.name);
        } else {
            addNotification({ title: 'Error', message: 'Could not update permission.', type: 'error' });
        }
    };

    const handle2FAToggleForUser = async (targetUser: User) => {
        const isEnabling = !targetUser.is_2fa_enabled;
        const updates: Partial<User> = { is_2fa_enabled: isEnabling };
        
        if (isEnabling) {
            // Generate new codes only if enabling, or if they don't exist
            if (!targetUser.backup_codes || targetUser.backup_codes.length === 0) {
                 updates.backup_codes = Array.from({ length: 3 }, () => 
                    Math.floor(100000 + Math.random() * 900000).toString()
                );
            }
        } else {
            updates.backup_codes = []; // Clear codes when disabling for security
        }
        
        const updatedUser = await updateUser(targetUser.email, updates);
        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.email === targetUser.email ? updatedUser : u));
            addNotification({ 
                title: `2FA ${isEnabling ? 'Enabled' : 'Disabled'}`, 
                message: `2FA has been ${isEnabling ? 'enabled' : 'disabled'} for ${targetUser.name}.`, 
                type: 'success' 
            });
            logAdminActivity(`toggled 2FA ${isEnabling ? 'ON' : 'OFF'} for`, targetUser.name);
        } else {
            addNotification({ title: 'Error', message: 'Could not update 2FA status.', type: 'error' });
        }
    };

    const handleConfirmReset2FACodes = async () => {
        if (!resetUser) return;
        const newCodes = Array.from({ length: 3 }, () => 
            Math.floor(100000 + Math.random() * 900000).toString()
        );
        const updates: Partial<User> = { backup_codes: newCodes };
        
        const updatedUser = await updateUser(resetUser.email, updates);
        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.email === resetUser.email ? updatedUser : u));
            addNotification({ 
                title: '2FA Codes Reset', 
                message: `New backup codes have been generated for ${resetUser.name}.`, 
                type: 'success' 
            });
            logAdminActivity('reset 2FA codes for', resetUser.name);
        } else {
            addNotification({ title: 'Error', message: 'Could not reset 2FA codes.', type: 'error' });
        }
        setResetUser(null);
    };

    const handleSendPasswordReset = async (targetUser: User) => {
        try {
            await sendPasswordResetEmail(auth, targetUser.email);
            addNotification({ title: 'Email Sent', message: `Password reset link sent to ${targetUser.email}.`, type: 'success' });
            logAdminActivity('sent password reset to', targetUser.name);
        } catch (error: any) {
            addNotification({ title: 'Error', message: error.message || 'Failed to send reset link.', type: 'error' });
        }
    };

    const handleConfirmClearLog = useCallback(async () => {
        const originalLog = [...activityLog];
        setActivityLog([]); // Optimistic update
        setIsClearLogModalOpen(false);

        try {
            await clearActivityLog();
            addNotification({ title: 'Log Cleared', message: 'The activity log has been cleared.', type: 'success' });
        } catch (error) {
            console.error("Failed to clear log, reverting.", error);
            addNotification({ title: "Clear Failed", message: "Could not clear the activity log.", type: "error" });
            setActivityLog(originalLog);
        }
    }, [activityLog, addNotification]);

    const handleDeleteLog = useCallback(async (logId: number) => {
        const originalLog = [...activityLog];
        setActivityLog(prev => prev.filter(l => l.id !== logId));

        try {
            await deleteActivityLog(logId);
            // Success is handled optimistically
        } catch (error) {
            console.error("Failed to delete log, reverting.", error);
            addNotification({ title: "Delete Failed", message: "Could not delete log entry. Check RLS policies.", type: "error" });
            setActivityLog(originalLog);
        }
    }, [activityLog, addNotification]);

    const statusConfig: Record<string, { class: string; label: string; color: string; ring: string }> = {
        'pending': { label: 'Pending', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', color: 'bg-amber-500', ring: 'ring-amber-500' },
        'verified': { label: 'Verified', class: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', color: 'bg-green-500', ring: 'ring-green-500' },
        'unverified': { label: 'Unverified', class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', color: 'bg-red-500', ring: 'ring-red-500' },
    };

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
            <ParticlesBackground />
            <ConfirmationModal
                isOpen={resetUser !== null}
                onClose={() => setResetUser(null)}
                onConfirm={handleConfirmReset2FACodes}
                title="Reset 2FA Backup Codes"
                confirmText="Yes, Reset"
            >
                <p>Are you sure you want to reset the backup codes for <strong className="text-slate-800 dark:text-slate-100">{resetUser?.name}</strong>?</p>
                <p className="mt-2 text-sm text-slate-500">This will invalidate all their existing codes and generate new ones.</p>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isClearLogModalOpen}
                onClose={() => setIsClearLogModalOpen(false)}
                onConfirm={handleConfirmClearLog}
                title="Confirm Clear Log"
                confirmText="Yes, Clear Log"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Are you sure you want to clear the entire activity log? This action is permanent and cannot be undone.</p>
            </ConfirmationModal>
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                         <MenuIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <AdminIcon className="w-5 h-5 text-amber-500"/>
                        <span>Admin Dashboard</span>
                    </div>
                 </div>
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Navigation</h2>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-2 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onNavigateWithinApp(`admin/${item.id}`)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                                view === item.id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`${view === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                    {item.icon}
                                </div>
                                <span>{item.label}</span>
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.countColor}`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>
            
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Desktop Header & Nav */}
            <div className="hidden md:block flex-shrink-0 p-4 sm:p-6 md:p-8 pb-0">
                <header>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </header>
                <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto hide-scrollbar" aria-label="Tabs">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onNavigateWithinApp(`admin/${item.id}`)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                    view === item.id
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                                {item.count !== undefined && item.count > 0 && (
                                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.countColor}`}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-6">
                {view === 'management' && (
                    <div className="space-y-6 animate-fade-in" key="management">
                        <p className="text-slate-500 dark:text-slate-400">Approve, reject, or manage user access permissions.</p>
                        
                        {/* Improved Stat Cards with visual flair */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard 
                                title="Pending Approval" 
                                value={stats.pending} 
                                color="bg-amber-500" 
                                icon={<MailIcon />}
                                onClick={() => handleFilterClick('pending')} 
                                isActive={activeFilter === 'pending'} 
                            />
                            <StatCard 
                                title="Verified Users" 
                                value={stats.verified} 
                                color="bg-green-500" 
                                icon={<CheckCircleIcon />}
                                onClick={() => handleFilterClick('verified')} 
                                isActive={activeFilter === 'verified'} 
                            />
                            <StatCard 
                                title="Unverified Emails" 
                                value={stats.unverified} 
                                color="bg-red-500" 
                                icon={<XCircleIcon />}
                                onClick={() => handleFilterClick('unverified')} 
                                isActive={activeFilter === 'unverified'} 
                            />
                        </section>

                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                            {/* Glassmorphic Header */}
                            <div className="p-5 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
                                <div className="relative w-full sm:w-72 group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <SearchIcon className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="search" 
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)} 
                                        placeholder="Search users..." 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow shadow-sm" 
                                    />
                                </div>
                                
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <select 
                                        value={sortBy} 
                                        onChange={(e) => setSortBy(e.target.value as any)} 
                                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium shadow-sm cursor-pointer"
                                    >
                                        <option value="created_at">Newest First</option>
                                        <option value="name">Name (A-Z)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="hidden md:flex bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex-1 p-4">User Identity</div>
                                    <div className="w-1/4 p-4">Access Control</div>
                                    <div className="w-1/4 p-4 text-right">Actions</div>
                                </div>
                                <div className="flex flex-col gap-4 md:gap-0 md:block md:divide-y md:divide-slate-100 md:dark:divide-slate-800 p-4 md:p-0">
                                    {filteredAndSortedUsers.map(u => (
                                        <div key={u.id} className="flex flex-col md:flex-row bg-white dark:bg-slate-800 md:bg-transparent rounded-xl md:rounded-none shadow-sm md:shadow-none border border-slate-200 dark:border-slate-700 md:border-0 md:border-b md:border-slate-100 md:dark:border-slate-800 overflow-hidden transition-colors group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 relative">
                                            {/* User Identity Section */}
                                            <div className="flex-1 p-4 md:p-5 flex flex-row items-center gap-4 border-b md:border-b-0 border-slate-100 dark:border-slate-700">
                                                <div className="relative flex-shrink-0">
                                                    <div className={`absolute -inset-0.5 rounded-full ${statusConfig[u.status].ring} opacity-0 group-hover:opacity-30 transition-opacity blur-[2px]`}></div>
                                                    <img 
                                                        src={getCloudinaryUrl(u.avatar, { width: 56, height: 56, radius: 'max' })} 
                                                        alt={u.name} 
                                                        className="relative w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" 
                                                    />
                                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${statusConfig[u.status].color}`}></div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 text-base md:text-lg truncate">{u.name}</div>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig[u.status].class}`}>
                                                            {statusConfig[u.status].label}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">Joined {timeAgo(new Date(u.created_at))}</div>
                                                </div>
                                            </div>

                                            {/* Access Control Section */}
                                            <div className="w-full md:w-1/4 p-4 md:p-5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 md:bg-transparent">
                                                <div className="flex flex-row md:flex-col gap-3 justify-between md:justify-center h-full">
                                                    <div className="flex flex-col gap-1 w-1/2 md:w-full">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Writeups</span>
                                                        <PermissionDropdown 
                                                            currentAccess={u.writeup_access}
                                                            onChange={(access) => handleWriteupAccessChange(u, access)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-1/2 md:w-full">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security & Docs</span>
                                                        <div className="flex flex-col gap-2">
                                                            <button 
                                                                onClick={() => handleDocAccessChange(u)}
                                                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                                                    u.doc_access 
                                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                                                }`}
                                                            >
                                                                <span>Docs</span>
                                                                {u.doc_access ? <CheckCircleIcon className="w-3.5 h-3.5"/> : <XCircleIcon className="w-3.5 h-3.5"/>}
                                                            </button>
                                                            
                                                            {/* 2FA Control Pill */}
                                                            <div className="relative group/2fa w-full">
                                                                <button
                                                                    onClick={() => handle2FAToggleForUser(u)}
                                                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                                                        u.is_2fa_enabled
                                                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                                                    }`}
                                                                >
                                                                    <span className="flex items-center gap-1.5">
                                                                        <ShieldIcon className="w-3.5 h-3.5" />
                                                                        2FA: {u.is_2fa_enabled ? 'ON' : 'OFF'}
                                                                    </span>
                                                                </button>
                                                                {u.is_2fa_enabled && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); setResetUser(u); }}
                                                                        className="w-full mt-1 text-[10px] text-center font-medium text-slate-400 hover:text-red-500 hover:underline transition-colors"
                                                                    >
                                                                        Reset Codes
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Section */}
                                            <div className="w-full md:w-1/4 p-4 md:p-5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-900/50 md:bg-transparent">
                                                <div className="flex gap-2 w-full md:w-auto">
                                                     {/* Password Reset Button - Always visible for quick access */}
                                                     <button
                                                        onClick={() => handleSendPasswordReset(u)}
                                                        className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex-shrink-0"
                                                        title="Send Password Reset Email"
                                                     >
                                                        <KeyIcon className="w-5 h-5"/>
                                                     </button>

                                                     {u.status === 'pending' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(u)} 
                                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg shadow-lg shadow-green-500/30 transition-all transform active:scale-95 text-xs font-bold"
                                                            >
                                                                <CheckCircleIcon className="w-4 h-4"/> Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(u)} 
                                                                className="flex-1 md:flex-none flex items-center justify-center p-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                                                                title="Reject"
                                                            >
                                                                <XCircleIcon className="w-5 h-5"/>
                                                            </button>
                                                        </>
                                                     )}
                                                     {u.status === 'verified' && (
                                                        <button 
                                                            onClick={() => handleRevoke(u)} 
                                                            className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all text-xs font-bold shadow-sm"
                                                        >
                                                            Revoke Access
                                                        </button>
                                                     )}
                                                     {u.status === 'unverified' && (
                                                        <button 
                                                            onClick={() => handleApprove(u)} 
                                                            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 text-xs font-bold"
                                                        >
                                                            Verify User
                                                        </button>
                                                     )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredAndSortedUsers.length === 0 && (
                                        <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                                    <UsersIcon className="w-8 h-8 opacity-50" />
                                                </div>
                                                <p className="text-lg font-medium">No users found</p>
                                                <p className="text-sm">Try adjusting your search or filters.</p>
                                                <button onClick={() => {setSearchQuery(''); setActiveFilter(null);}} className="text-indigo-500 hover:underline text-sm font-semibold mt-2">Clear all filters</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {view === 'requests' && (
                    <div className="space-y-6 animate-fade-in" key="requests">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                           <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                               <div className="flex items-center gap-2">
                                 <KeyIcon className="w-5 h-5 text-slate-500"/>
                                 <h3 className="text-lg font-bold">Writeup Access Requests</h3>
                               </div>
                           </header>
                           <div className="p-4">
                               {writeupAccessRequests.length > 0 ? (
                                   <div className="space-y-3">
                                       {writeupAccessRequests.map(requestingUser => (
                                           <div key={requestingUser.id} className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-700/50">
                                               <div className="flex items-center gap-3">
                                                   <img src={getCloudinaryUrl(requestingUser.avatar, { width: 40, height: 40, radius: 'max' })} alt={requestingUser.name} className="w-10 h-10 rounded-full" />
                                                   <div>
                                                       <p className="font-semibold">{requestingUser.name}</p>
                                                       <p className="text-xs text-slate-500">{requestingUser.email}</p>
                                                   </div>
                                               </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => onRejectWriteupAccess(requestingUser)} className="px-3 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200">Reject</button>
                                                    <button onClick={() => onApproveWriteupAccess(requestingUser)} className="px-3 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-700 hover:bg-green-200">Approve</button>
                                                </div>
                                           </div>
                                       ))}
                                   </div>
                               ) : (
                                   <p className="text-sm text-slate-500 dark:text-slate-400">No pending writeup access requests.</p>
                               )}
                           </div>
                        </div>
                    </div>
                )}

                {view === 'inquiries' && (
                    <div className="space-y-6 animate-fade-in" key="inquiries">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Support Inquiries</h2>
                                <p className="text-sm text-slate-500">Manage contact form submissions from the Help Center.</p>
                            </div>
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
                                {contactRequests.length} Pending
                            </span>
                        </div>

                        <div className="grid gap-4">
                            {contactRequests.length === 0 ? (
                                <div className="p-12 text-center bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">All caught up!</h3>
                                    <p className="text-slate-500">No pending support inquiries at the moment.</p>
                                </div>
                            ) : (
                                contactRequests.map(request => {
                                    const isMember = memberEmails.has(request.email);
                                    return (
                                        <div key={request.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                            {request.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-slate-800 dark:text-white">{request.name}</h4>
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${isMember ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                                                    {isMember ? 'Member' : 'Guest'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-mono">{request.email}</p>
                                                        </div>
                                                        <span className="ml-auto text-[10px] text-slate-400 font-mono">
                                                            {new Date(request.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-4 border-indigo-500">
                                                        {request.message}
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-col justify-end gap-2">
                                                    <a 
                                                        href={`mailto:${request.email}`} 
                                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                                                    >
                                                        <MailIcon className="w-4 h-4" />
                                                        Reply
                                                    </a>
                                                    <button 
                                                        onClick={() => handleMarkAsHandled(request.id)}
                                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-green-900/40 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 rounded-lg text-sm font-bold transition-all"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        Handled
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {view === 'live' && (
                    <div className="space-y-6 animate-fade-in" key="live">
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                    <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon className="w-5 h-5 text-slate-500"/>
                                            <h3 className="text-lg font-bold">Live Users ({liveUsers.length})</h3>
                                        </div>
                                    </header>
                                    <div className="p-4 max-h-96 overflow-y-auto">
                                        {liveUsers.length > 0 ? (
                                             <div className="space-y-3">
                                                {liveUsers.map(liveUser => (
                                                    <div key={liveUser.email} className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <img src={getCloudinaryUrl(liveUser.avatar, { width: 36, height: 36, radius: 'max' })} alt={liveUser.name} className="w-9 h-9 rounded-full" />
                                                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-slate-800" />
                                                        </div>
                                                        <div>
                                                           <p className="font-semibold text-sm">{liveUser.name}</p>
                                                           <p className="text-xs text-slate-400">Active now</p>
                                                        </div>
                                                    </div>
                                                ))}
                                             </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">No users are currently active.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ActivityLogIcon className="w-5 h-5 text-slate-500"/>
                                        <h3 className="text-lg font-bold">Activity Log</h3>
                                    </div>
                                    <button onClick={() => setIsClearLogModalOpen(true)} className="text-xs font-semibold text-red-500 dark:text-red-400 hover:underline">Clear Log</button>
                                </header>
                                <div className="p-4 max-h-[40rem] overflow-y-auto">
                                    <ul className="space-y-4">
                                        {activityLog.map(log => (
                                            <li key={log.id} className="group flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <img src={getCloudinaryUrl(log.user.avatar, { width: 32, height: 32, radius: 'max' })} alt={log.user.name} className="w-8 h-8 rounded-full mt-0.5" />
                                                    <div>
                                                        <p className="text-sm">
                                                            <span className="font-semibold text-slate-800 dark:text-slate-100">{log.user.name}</span>
                                                            <span className="text-slate-500"> {log.action}</span>
                                                            {log.target && <span className="font-semibold text-slate-600 dark:text-slate-300"> {log.target}</span>}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(new Date(log.timestamp))}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteLog(log.id)} 
                                                    className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete log entry"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                         </div>
                    </div>
                )}
                 {view === 'broadcast' && (
                    <BroadcastChannel adminUser={user} allUsers={allUsers} />
                )}
                {view === 'mail_broadcast' && (
                    <MailBroadcastChannel adminUser={user} allUsers={allUsers} />
                )}
                {view === 'controller' && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldIcon className="w-6 h-6 text-indigo-500" />
                                Global Settings Controller
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Manage global application settings and features for all users.
                            </p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Welcome Animation</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Enable or disable the welcome animation for all users when they log in.
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={async () => {
                                            const newValue = !isWelcomeAnimationEnabled;
                                            setIsWelcomeAnimationEnabled(newValue);
                                            const startISO = toISOString(maintenanceStartTime);
                                            const endISO = toISOString(maintenanceEndTime);
                                            try {
                                                await updateGlobalSettings({ 
                                                    isWelcomeAnimationEnabled: newValue, 
                                                    isMaintenanceMode, 
                                                    maintenanceMessage, 
                                                    maintenanceStartTime: startISO, 
                                                    maintenanceEndTime: endISO 
                                                });
                                                addNotification({ title: 'Success', message: `Welcome animation ${newValue ? 'enabled' : 'disabled'}.`, type: 'success' });
                                            } catch (error) {
                                                setIsWelcomeAnimationEnabled(!newValue);
                                                addNotification({ title: 'Error', message: 'Failed to update settings.', type: 'error' });
                                            }
                                        }}
                                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                            isWelcomeAnimationEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span className="sr-only">Toggle Welcome Animation</span>
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                isWelcomeAnimationEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                            {/* Maintenance Mode */}
                            <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">System Maintenance</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Enable maintenance mode to restrict user access.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {isMaintenanceMode ? 'Maintenance Mode: ON' : 'Maintenance Mode: OFF'}
                                        </span>
                                        {isMaintenanceMode && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                isMaintenanceActive({ isMaintenanceMode, maintenanceStartTime: toISOString(maintenanceStartTime), maintenanceEndTime: toISOString(maintenanceEndTime) } as any)
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {isMaintenanceActive({ isMaintenanceMode, maintenanceStartTime: toISOString(maintenanceStartTime), maintenanceEndTime: toISOString(maintenanceEndTime) } as any)
                                                    ? 'Active Now'
                                                    : 'Scheduled'}
                                            </span>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const newValue = !isMaintenanceMode;
                                                
                                                const startISO = toISOString(maintenanceStartTime);
                                                const endISO = toISOString(maintenanceEndTime);
                                                
                                                try {
                                                    await updateGlobalSettings({ 
                                                        isWelcomeAnimationEnabled,
                                                        isMaintenanceMode: newValue, 
                                                        maintenanceMessage, 
                                                        maintenanceStartTime: startISO, 
                                                        maintenanceEndTime: endISO 
                                                    });
                                                    
                                                    if (newValue) {
                                                        await notifyUsersOfMaintenance(true, maintenanceMessage, startISO, endISO);
                                                    }

                                                    addNotification({ 
                                                        title: 'Success', 
                                                        message: `Maintenance system ${newValue ? 'armed' : 'disarmed'}.`, 
                                                        type: 'success' 
                                                    });
                                                } catch (error) {
                                                    addNotification({ 
                                                        title: 'Error', 
                                                        message: 'Failed to update maintenance settings.', 
                                                        type: 'error' 
                                                    });
                                                }
                                            }}
                                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                            isMaintenanceMode ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span className="sr-only">Toggle Maintenance</span>
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                isMaintenanceMode ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Maintenance Message</label>
                                    <input 
                                        type="text" 
                                        value={maintenanceMessage || ''} 
                                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                                            {maintenanceStartTime && (
                                                <button 
                                                    onClick={() => setMaintenanceStartTime('')}
                                                    className="text-[10px] text-red-500 hover:underline"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <input 
                                            type="datetime-local" 
                                            value={maintenanceStartTime || ''} 
                                            onChange={(e) => setMaintenanceStartTime(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
                                            {maintenanceEndTime && (
                                                <button 
                                                    onClick={() => setMaintenanceEndTime('')}
                                                    className="text-[10px] text-red-500 hover:underline"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <input 
                                            type="datetime-local" 
                                            value={maintenanceEndTime || ''} 
                                            onChange={(e) => setMaintenanceEndTime(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 italic">
                                    * Times are scheduled in your local timezone and converted to UTC for global consistency.
                                    The toggle switch enables the maintenance system; if times are set, it will follow the schedule.
                                </p>
                                <button
                                    onClick={async () => {
                                        const startISO = toISOString(maintenanceStartTime);
                                        const endISO = toISOString(maintenanceEndTime);
                                        await updateGlobalSettings({ 
                                            isWelcomeAnimationEnabled,
                                            isMaintenanceMode, 
                                            maintenanceMessage, 
                                            maintenanceStartTime: startISO, 
                                            maintenanceEndTime: endISO 
                                        });
                                        
                                        if (isMaintenanceMode) {
                                            await notifyUsersOfMaintenance(true, maintenanceMessage, startISO, endISO);
                                        }

                                        addNotification({ title: 'Success', message: 'Maintenance settings updated.', type: 'success' });
                                    }}
                                    className="w-full p-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
