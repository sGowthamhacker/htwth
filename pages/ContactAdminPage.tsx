
import React, { useState } from 'react';
import { User } from '../types';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import AnimatedSendButton from '../components/AnimatedSendButton';

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
        // Increased delay to allow the button animation (take-off and land) to complete
        setTimeout(() => {
            onSendMessage(name, email, message);
            setStatus('sent');
        }, 2500); 
    };

    if (status === 'sent') {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900 animate-fade-in">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Message Sent!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">An administrator will review your message and get back to you shortly.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 md:p-8">
            <div className="max-w-xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Contact an Administrator</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Have a question, concern, or suggestion? Send us a message and we'll get back to you.</p>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Your Name</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="modern-input" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">Your Email</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="modern-input" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={8}
                            className="modern-textarea"
                            placeholder="Please describe your inquiry in detail..."
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-4">
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
