import React, { useState, useEffect } from 'react';
import { User, SupportTicket, TicketMessage } from '../types';
import { 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Search, 
  ChevronRight,
  ChevronLeft,
  Check,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Sparkles,
  Terminal,
  Key,
  Bug,
  HelpCircle,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface SupportTicketPageProps {
  user: User;
  addNotification?: (notification: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

const STORAGE_KEY = 'htwth_support_tickets';

const PRESET_TEMPLATES = [
  {
    title: 'Kali Linux Tool Access',
    category: 'Technical Issue' as const,
    priority: 'High' as const,
    icon: Terminal,
    subject: 'Request for access / guide to Kali Linux security tools',
    description: 'Hello Support Team,\n\nI need assistance accessing specialized Kali tools or documentation for my workspace.\n\nSpecific Tool / Area: '
  },
  {
    title: 'Account & Login Issue',
    category: 'Account Access' as const,
    priority: 'Urgent' as const,
    icon: Key,
    subject: 'Assistance required with account permissions or login',
    description: 'Hello Support Team,\n\nI am experiencing an issue accessing my account or changing permissions.\n\nDetails: '
  },
  {
    title: 'Report a Platform Bug',
    category: 'Bug Report' as const,
    priority: 'Medium' as const,
    icon: Bug,
    subject: 'Bug report regarding platform feature or UI',
    description: 'Hello Support Team,\n\nI noticed an error or visual glitch while using the app.\n\nSteps to reproduce:\n1. \n2. \n3. '
  },
  {
    title: 'General Support Inquiry',
    category: 'Billing / General' as const,
    priority: 'Low' as const,
    icon: HelpCircle,
    subject: 'General question about platform features',
    description: 'Hello Support Team,\n\nI have a general question about how to use platform features.'
  }
];

const INITIAL_SAMPLE_TICKETS: SupportTicket[] = [];

export const getStoredTickets = (): SupportTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TICKETS));
      return INITIAL_SAMPLE_TICKETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const now = Date.now();
      const oneHourMs = 3600000;
      // Clean out legacy mock sample tickets and resolved tickets older than 1 hour
      const clean = parsed.filter(t => {
        if (t.id === 'tck-1' || t.ticketNumber === 'TCK-1001' || t.userName === 'Sample User') return false;
        if (t.status === 'Resolved') {
          const resolvedTime = new Date(t.updatedAt || t.createdAt || 0).getTime();
          if (now - resolvedTime > oneHourMs) {
            return false;
          }
        }
        return true;
      });
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
      return clean;
    }
    return INITIAL_SAMPLE_TICKETS;
  } catch (e) {
    console.error('Failed to load support tickets from localStorage:', e);
    return INITIAL_SAMPLE_TICKETS;
  }
};

export const saveStoredTickets = (tickets: SupportTicket[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('htwth_tickets_updated'));
    fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets, replace: true })
    }).catch(err => console.warn('Server ticket sync note:', err));
  } catch (e) {
    console.error('Failed to save support tickets to localStorage:', e);
  }
};

export const syncTicketsFromBackend = async (): Promise<SupportTicket[]> => {
  try {
    const res = await fetch('/api/support/tickets');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.tickets)) {
        const sorted = data.tickets.sort((a: SupportTicket, b: SupportTicket) => 
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );
        sorted.forEach((t: SupportTicket) => {
          if (Array.isArray(t.messages)) {
            const msgMap = new Map<string, TicketMessage>();
            t.messages.forEach(m => msgMap.set(m.id, m));
            t.messages = Array.from(msgMap.values()).sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
        return sorted;
      }
    }
  } catch (e) {
    // fallback
  }
  return getStoredTickets();
};

const SupportTicketPage: React.FC<SupportTicketPageProps> = ({ user, addNotification }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Technical Issue');
  const [priority, setPriority] = useState<SupportTicket['priority']>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmittingWithAi, setIsSubmittingWithAi] = useState(false);

  // Swipe verification states
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeSuccess, setSwipeSuccess] = useState(false);
  const [swipeError, setSwipeError] = useState('');
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef<number>(0);

  // Reply State
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  const confirmDeleteTicket = () => {
    if (!ticketToDelete) return;
    const updated = tickets.filter(t => t.id !== ticketToDelete.id);
    saveStoredTickets(updated);
    setTickets(updated);
    if (selectedTicketId === ticketToDelete.id) setSelectedTicketId(null);
    
    fetch(`/api/support/tickets/${ticketToDelete.id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Server ticket delete note:', err));

    setTicketToDelete(null);

    if (addNotification) {
      addNotification({
        title: 'Ticket Deleted',
        message: `Support ticket #${ticketToDelete.ticketNumber} removed successfully.`,
        type: 'warning'
      });
    }
  };

  const loadTickets = async () => {
    const all = await syncTicketsFromBackend();
    setTickets(all);
  };

  useEffect(() => {
    loadTickets();
    const handleUpdate = () => {
      const all = getStoredTickets();
      setTickets(all);
    };
    window.addEventListener('htwth_tickets_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(() => {
      syncTicketsFromBackend().then(all => setTickets(all));
    }, 3000);

    return () => {
      window.removeEventListener('htwth_tickets_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Drag / swipe event listener logic
  useEffect(() => {
    if (!isSwiping) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return;
      const clientX = e.clientX;
      const deltaX = clientX - startXRef.current;
      const maxDistance = sliderRef.current.clientWidth - 56;
      const progress = Math.min(100, Math.max(0, (deltaX / maxDistance) * 100));
      setSwipeProgress(progress);

      if (progress >= 100 && !swipeSuccess) {
        setSwipeSuccess(true);
        setIsSwiping(false);
        setSwipeProgress(100);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!sliderRef.current || e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      const deltaX = clientX - startXRef.current;
      const maxDistance = sliderRef.current.clientWidth - 56;
      const progress = Math.min(100, Math.max(0, (deltaX / maxDistance) * 100));
      setSwipeProgress(progress);

      if (progress >= 100 && !swipeSuccess) {
        setSwipeSuccess(true);
        setIsSwiping(false);
        setSwipeProgress(100);
      }
    };

    const handleMouseUp = () => {
      setIsSwiping(false);
      setSwipeProgress(p => p >= 100 ? 100 : 0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isSwiping, swipeSuccess, subject, description]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setSwipeError('Please fill in the Subject and Detailed Description first.');
      return;
    }
    if (swipeSuccess) {
      handleCreateTicket();
    } else {
      setSwipeError('Please swipe the verification slider rightwards at the bottom to submit!');
    }
  };

  // Filter user's own tickets (or all if admin)
  const myTickets = tickets.filter(t => 
    user.role === 'admin' ? true : t.userEmail.toLowerCase() === (user.email || '').toLowerCase()
  );

  const filteredTickets = myTickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const hasSystemNotice = selectedTicket?.messages.some(m => 
    m.senderName === 'System Notice' || 
    m.id.startsWith('msg-sys-') || 
    m.message.includes("Your ticket was resolved")
  ) || false;
  const isClosedOrResolved = selectedTicket ? (selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved' || hasSystemNotice) : false;

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setSubject(preset.subject);
    setCategory(preset.category);
    setPriority(preset.priority);
    setDescription(preset.description);
  };

  const handleCreateTicket = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const now = new Date().toISOString();
    const finalTicketNum = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalSubject = subject.trim();

    const newTicket: SupportTicket = {
      id: `tck-${Date.now()}`,
      ticketNumber: finalTicketNum,
      userEmail: user.email || 'user@htwth.com',
      userName: user.name || 'User',
      userAvatar: user.avatar,
      subject: finalSubject,
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
    saveStoredTickets(updated);
    setTickets(updated);

    if (addNotification) {
      addNotification({
        title: 'Support Ticket Created',
        message: `Ticket #${finalTicketNum} successfully created and sent to support.`,
        type: 'success'
      });
    }

    // Reset Form
    setSubject('');
    setCategory('Technical Issue');
    setPriority('Medium');
    setDescription('');
    setIsCreating(false);
    setSelectedTicketId(newTicket.id);
    setSwipeSuccess(false);
    setSwipeProgress(0);
    setSwipeError('');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const currentMsgText = replyMessage.trim();
    const now = new Date().toISOString();
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      senderName: user.name || (user.role === 'admin' ? 'App Support Team' : 'User'),
      senderEmail: user.email || '',
      senderRole: user.role === 'admin' ? 'admin' : 'user',
      avatar: user.avatar,
      message: currentMsgText,
      createdAt: now
    };

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: user.role === 'admin' ? ('In Progress' as const) : t.status,
          updatedAt: now,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    saveStoredTickets(updatedTickets);
    setTickets(updatedTickets);
    setReplyMessage('');

    if (addNotification) {
      addNotification({
        title: 'Reply Added',
        message: `Your message was added to Ticket #${selectedTicket.ticketNumber}.`,
        type: 'info'
      });
    }
  };

  const handleMarkResolved = (ticketId: string) => {
    const now = new Date().toISOString();
    const updated = tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' as const, updatedAt: now } : t);
    saveStoredTickets(updated);
    setTickets(updated);

    if (addNotification) {
      addNotification({
        title: 'Ticket Resolved',
        message: 'The support ticket was marked as resolved.',
        type: 'success'
      });
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Open</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"><AlertCircle className="w-3 h-3" /> In Progress</span>;
      case 'Resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      case 'Closed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"><CheckCircle2 className="w-3 h-3" /> Closed</span>;
    }
  };

  const getPriorityBadge = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">Low</span>;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 sm:p-4 md:p-6 overflow-hidden relative">
      
      {/* Mobile Floating Action Button (FAB) for Creating Ticket */}
      {!isCreating && !selectedTicketId && (
        <button
          onClick={() => {
            setIsCreating(true);
            setSelectedTicketId(null);
          }}
          className="fixed bottom-6 right-6 sm:hidden z-30 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg hover:bg-amber-600 active:scale-95 transition-all cursor-pointer"
          aria-label="Create Support Ticket"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight">Support Ticket Center</h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Submit support tickets, report bugs, or get direct admin assistance.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setSelectedTicketId(null);
          }}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCreating ? 'Cancel / My Tickets' : 'Create Support Ticket'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        
        {/* VIEW 1: Create New Ticket Form */}
        {isCreating ? (
          <div className="h-full overflow-y-auto custom-scrollbar max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Plus className="w-5 h-5 text-amber-500" /> Create Support Ticket
              </h2>
              <button 
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select a quick preset template below or fill in your ticket details.
            </p>

            {/* Quick Templates Dropdown Menu */}
            <div className="mb-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-xl p-3.5">
              <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" /> Quick Preset Templates
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const tmpl = PRESET_TEMPLATES.find(t => t.title === val);
                    if (tmpl) applyPreset(tmpl);
                  }
                  // Reset select back to placeholder so it can be re-triggered
                  e.target.value = "";
                }}
                defaultValue=""
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-slate-800 dark:text-slate-100"
              >
                <option value="" disabled>-- Click to choose a quick preset template... --</option>
                {PRESET_TEMPLATES.map((tmpl, idx) => (
                  <option key={idx} value={tmpl.title}>
                    {tmpl.title} ({tmpl.category} - {tmpl.priority})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ticket Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Assistance needed with Kali tool or account permissions"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Billing / General">Billing / General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Low">Low - General Question</option>
                    <option value="Medium">Medium - Normal Inquiry</option>
                    <option value="High">High - Major Feature Blocked</option>
                    <option value="Urgent">Urgent - Critical Account Issue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your request, steps to reproduce, or details..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 space-y-3">
                {/* Error message if they try to swipe/submit when form is incomplete */}
                {swipeError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-center text-xs font-bold leading-relaxed flex items-center justify-center gap-1.5 animate-bounce">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{swipeError}</span>
                  </div>
                )}

                {/* Verification Track or Verified + Submit Button */}
                {swipeSuccess ? (
                  <div className="space-y-3">
                    {/* Verified Track */}
                    <div 
                      className="relative w-full h-14 rounded-2xl border transition-all duration-300 select-none flex items-center overflow-hidden bg-emerald-500/10 border-emerald-500/30"
                    >
                      <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10" />
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 pointer-events-none select-none z-0">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Human Verification Success!
                        </span>
                      </div>
                      <div className="absolute right-1 w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg z-10 select-none">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white text-xs font-black uppercase tracking-widest transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-amber-500/10"
                    >
                      <Send className="w-4 h-4 animate-bounce" /> Submit Support Ticket
                    </button>
                  </div>
                ) : (
                  /* Left-to-Right Swipe verification track */
                  <div 
                    ref={sliderRef}
                    className={`relative w-full h-14 rounded-2xl border transition-all duration-300 select-none flex items-center overflow-hidden ${
                      isSwiping 
                        ? 'bg-slate-100 dark:bg-slate-800 border-amber-500/30 shadow-inner' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Shimmering / animated progress trail from left to right */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 dark:bg-emerald-500/20 transition-all duration-75"
                      style={{ width: `${swipeProgress}%` }}
                    />

                    {/* Background Track Text Label */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pointer-events-none select-none z-0 transition-opacity"
                      style={{ opacity: Math.max(0.15, 1 - swipeProgress / 60) }}
                    >
                      {isSwiping ? (
                        <span className="text-amber-600 dark:text-amber-400 animate-pulse">
                          Release on far right to verify ▶
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 animate-pulse">
                          Swipe Right to Verify ▶▶▶
                        </span>
                      )}
                    </div>

                    {/* Dragging Handle Button (Starts at Left, slides to Right) */}
                    <div
                      onMouseDown={(e) => {
                        if (!subject.trim() || !description.trim()) {
                          setSwipeError('Please fill in the Subject and Detailed Description first.');
                          return;
                        }
                        setSwipeError('');
                        setIsSwiping(true);
                        startXRef.current = e.clientX;
                      }}
                      onTouchStart={(e) => {
                        if (!subject.trim() || !description.trim()) {
                          setSwipeError('Please fill in the Subject and Detailed Description first.');
                          return;
                        }
                        setSwipeError('');
                        setIsSwiping(true);
                        startXRef.current = e.touches[0].clientX;
                      }}
                      className={`absolute left-1 w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-lg transition-transform z-10 select-none cursor-grab active:cursor-grabbing ${
                        isSwiping 
                          ? 'bg-amber-600 scale-95' 
                          : 'bg-amber-500 shadow-amber-500/20'
                      }`}
                      style={{
                        transform: `translateX(${sliderRef.current ? (swipeProgress * 0.01 * (sliderRef.current.clientWidth - 56)) : 0}px)`
                      }}
                    >
                      <ChevronRight className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setSwipeSuccess(false);
                      setSwipeProgress(0);
                      setSwipeError('');
                    }}
                    className="px-6 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel Creation
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : selectedTicket ? (
          
          /* VIEW 2: Selected Ticket Detail & Thread Conversation */
          <div className="h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Back to Tickets"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="truncate">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-amber-500">{selectedTicket.ticketNumber}</span>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{selectedTicket.subject}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Category: <b>{selectedTicket.category}</b></span>
                    <span>•</span>
                    <span>Created: {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {getPriorityBadge(selectedTicket.priority)}
                {getStatusBadge(selectedTicket.status)}

                {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                  <button
                    onClick={() => handleMarkResolved(selectedTicket.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}

                <button
                  onClick={() => setTicketToDelete(selectedTicket)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Scroll View */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
              {selectedTicket.messages
                .filter(msg => {
                  const isSystem = msg.senderName === 'System Notice' || msg.id.startsWith('msg-sys-') || msg.message.includes("Your ticket was resolved");
                  return !isSystem;
                })
                .map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 max-w-2xl ${isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAdmin ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : (msg.senderName?.[0] || 'U')}
                    </div>

                    <div className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] sm:text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {msg.senderName} {isAdmin && <span className="text-amber-500 font-extrabold">(Admin)</span>}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-xl whitespace-pre-wrap ${
                        isAdmin 
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs' 
                          : 'bg-amber-500 text-white font-medium shadow-xs'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            {!isClosedOrResolved ? (
              <form onSubmit={handleSendReply} className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Type message or reply..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Send Reply</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-rose-500/5 dark:bg-rose-500/10 border-t border-rose-500/20 flex flex-col items-center justify-center text-center space-y-2 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  ⚠️ Exclusive App UI Status Notice
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-bold max-w-xl leading-relaxed">
                  Your ticket was resolved. Note: Resolved/Closed support tickets are automatically deleted after 1 hr, and you can't reply to this support ID any more. If you have any doubt, please create a new support ticket.
                </p>
              </div>
            )}
          </div>
        ) : (

          /* VIEW 3: List of User's Support Tickets */
          <div className="h-full flex flex-col space-y-3">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                        statusFilter === st
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Mobile Button to create ticket */}
                <button
                  onClick={() => setIsCreating(true)}
                  className="sm:hidden px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Ticket
                </button>
              </div>
            </div>

            {/* Tickets Table / List */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2">
              {filteredTickets.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <LifeBuoy className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Support Tickets Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    {searchQuery || statusFilter !== 'All' 
                      ? 'No tickets match your search criteria.' 
                      : 'You have not created any support tickets yet.'}
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-sm"
                  >
                    + Create First Support Ticket
                  </button>
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs group"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-amber-500">{t.ticketNumber}</span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                          {t.subject}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-amber-500" /> {t.category}</span>
                        <span>•</span>
                        <span>Updated: {new Date(t.updatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-slate-400" /> {t.messages.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {getPriorityBadge(t.priority)}
                      {getStatusBadge(t.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTicketToDelete(t);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Support Ticket</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Ticket #{ticketToDelete.ticketNumber}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <b className="text-slate-900 dark:text-white">"{ticketToDelete.subject}"</b>? This action cannot be undone and will permanently remove the ticket thread.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTicket}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketPage;
