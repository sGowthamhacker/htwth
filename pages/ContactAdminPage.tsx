
import React, { useState } from 'react';
import { User, SupportTicket } from '../types';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import AnimatedSendButton from '../components/AnimatedSendButton';
import { getStoredTickets, saveStoredTickets } from './SupportTicketPage';
import { LifeBuoy } from 'lucide-react';

interface ContactAdminPageProps {
    user: User;
    onSendMessage: (name: string, email: string, message: string) => void;
}

const ContactAdminPage: React.FC<ContactAdminPageProps> = ({ user, onSendMessage }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || status !== 'idle') return;

        setStatus('sending');
        setTimeout(() => {
            onSendMessage(name, email, message);

            // Automatically register as a Support Ticket in localStorage as well
            try {
                const existing = getStoredTickets();
                const newTicketNum = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
                const now = new Date().toISOString();
                const newTicket: SupportTicket = {
                    id: `tck-${Date.now()}`,
                    ticketNumber: newTicketNum,
                    userEmail: email || user.email || 'user@htwth.com',
                    userName: name || user.name || 'User',
                    userAvatar: user.avatar,
                    subject: message.slice(0, 60) + (message.length > 60 ? '...' : ''),
                    category: 'Billing / General',
                    priority: 'Medium',
                    status: 'Open',
                    createdAt: now,
                    updatedAt: now,
                    messages: [
                        {
                            id: `msg-${Date.now()}`,
                            senderName: name || user.name || 'User',
                            senderEmail: email || user.email || 'user@htwth.com',
                            senderRole: user.role === 'admin' ? 'admin' : 'user',
                            avatar: user.avatar,
                            message: message.trim(),
                            createdAt: now
                        }
                    ]
                };
                saveStoredTickets([newTicket, ...existing]);
            } catch (e) {
                console.error("Failed to auto-create support ticket from contact admin", e);
            }

            setStatus('sent');
        }, 2500); 
    };

    if (status === 'sent') {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Message & Ticket Sent!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                    An administrator will review your message. A new support ticket has been created automatically in your Support Ticket Center.
                </p>
                <button
                    onClick={() => {
                        setStatus('idle');
                        setMessage('');
                    }}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all cursor-pointer shadow-md"
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 md:p-8">
            <div className="max-w-xl mx-auto">
                <header className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <LifeBuoy className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">Contact Administrator</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Have a question, concern, or suggestion? Submit a message here to automatically create an official support ticket.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="modern-input" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Email</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="modern-input" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Description</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={6}
                            className="modern-textarea"
                            placeholder="Please describe your inquiry or problem in detail..."
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <AnimatedSendButton 
                            isSending={status === 'sending'} 
                            disabled={status !== 'idle' || !message.trim()} 
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactAdminPage;
