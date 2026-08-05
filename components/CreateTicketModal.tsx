import React, { useState, useEffect } from 'react';
import { User, SupportTicket } from '../types';
import { getStoredTickets, saveStoredTickets } from '../pages/SupportTicketPage';
import { 
  X, 
  Send, 
  LifeBuoy, 
  Sparkles, 
  Bug, 
  Key, 
  Terminal, 
  HelpCircle,
  AlertTriangle,
  Tag,
  AlignLeft,
  Check
} from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  addNotification?: (notification: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
  onTicketCreated?: (ticket: SupportTicket) => void;
}

const PRESET_TEMPLATES = [
  {
    title: 'Bug Report',
    category: 'Bug Report' as const,
    priority: 'High' as const,
    icon: Bug,
    subject: 'Bug report: ',
    description: 'Hello Support Team,\n\nI encountered a bug or error while using the platform.\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:'
  },
  {
    title: 'Feature Request',
    category: 'Feature Request' as const,
    priority: 'Medium' as const,
    icon: Sparkles,
    subject: 'Feature Request: ',
    description: 'Hello Support Team,\n\nI would like to suggest a new feature or improvement:\n\nFeature summary:\n\nWhy this would be useful:'
  },
  {
    title: 'Account & Access',
    category: 'Account Access' as const,
    priority: 'Urgent' as const,
    icon: Key,
    subject: 'Account access or permission issue',
    description: 'Hello Support Team,\n\nI need assistance regarding my user account or permissions.\n\nIssue details:'
  },
  {
    title: 'Technical Support',
    category: 'Technical Issue' as const,
    priority: 'Medium' as const,
    icon: Terminal,
    subject: 'Technical support regarding tools or workspace',
    description: 'Hello Support Team,\n\nI am seeking technical guidance or help with platform tools.\n\nDetails:'
  }
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  user,
  addNotification,
  onTicketCreated
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Support' as any);
  const [priority, setPriority] = useState<SupportTicket['priority']>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setCategory('Technical Issue');
      setPriority('Medium');
      setDescription('');
      setActivePreset(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setSubject(preset.subject);
    setCategory(preset.category);
    setPriority(preset.priority);
    setDescription(preset.description);
    setActivePreset(preset.title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const tickets = getStoredTickets();
      const newTicketNum = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      const newTicket: SupportTicket = {
        id: `tck-${Date.now()}`,
        ticketNumber: newTicketNum,
        userEmail: user.email || 'user@htwth.com',
        userName: user.name || 'User',
        userAvatar: user.avatar,
        subject: subject.trim(),
        category,
        priority,
        status: 'Open',
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderName: user.name || 'User',
            senderEmail: user.email || 'user@htwth.com',
            senderRole: user.role === 'admin' ? 'admin' : 'user',
            avatar: user.avatar,
            message: description.trim(),
            createdAt: now
          }
        ]
      };

      const updated = [newTicket, ...tickets];
      saveStoredTickets(updated, { type: 'created', ticket: newTicket });

      if (addNotification) {
        addNotification({
          title: 'Support Ticket Created',
          message: `Ticket #${newTicketNum} has been submitted successfully.`,
          type: 'success'
        });
      }

      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }

      onClose();
    } catch (err) {
      console.error('Failed to create ticket', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Create Support Ticket
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit an official ticket to administrators for fast support or requests.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4">
          
          {/* Preset Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Preset Templates
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_TEMPLATES.map((preset) => {
                const Icon = preset.icon;
                const isSelected = activePreset === preset.title;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-amber-500/40 hover:bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <span className="text-[11px] font-bold leading-tight">
                      {preset.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form id="create-ticket-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5 text-amber-500" /> Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Issue accessing Kali Linux tools or account permissions"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" /> Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
                >
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Account Access">Account Access</option>
                  <option value="Billing / General">Billing / General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
                >
                  <option value="Low">Low - General Question</option>
                  <option value="Medium">Medium - Normal Request</option>
                  <option value="High">High - Major Feature Affected</option>
                  <option value="Urgent">Urgent - Critical Account Issue</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description / Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your problem, steps to reproduce, or details about your request..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all custom-scrollbar"
              />
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-ticket-form"
            disabled={isSubmitting || !subject.trim() || !description.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit Ticket</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateTicketModal;
