import React, { useState, useEffect } from 'react';
import { User, SupportTicket, TicketMessage } from '../types';
import { getStoredTickets, saveStoredTickets, syncTicketsFromBackend } from './SupportTicketPage';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Trash2, 
  ChevronRight, 
  ArrowLeft, 
  User as UserIcon,
  Tag,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Inbox
} from 'lucide-react';

interface TicketSystemPageProps {
  user: User;
  addNotification?: (notification: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

const QUICK_RESPONSES = [
  "Thank you for contacting support. We are actively investigating your request.",
  "Your account access permissions have been verified and updated.",
  "Could you please provide additional details or screenshots regarding this issue?",
  "This issue has been resolved. Please let us know if you need further assistance."
];

const TicketSystemPage: React.FC<TicketSystemPageProps> = ({ user, addNotification }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState<SupportTicket['status']>('In Progress');
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  const loadTickets = async () => {
    const all = await syncTicketsFromBackend();
    setTickets(all);
  };

  useEffect(() => {
    if (selectedTicket) {
      setReplyStatus(selectedTicket.status);
    }
  }, [selectedTicketId]);

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

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' ? true : t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    const now = new Date().toISOString();
    const updated = tickets.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: now } : t);
    saveStoredTickets(updated);
    setTickets(updated);

    if (addNotification) {
      addNotification({
        title: 'Status Updated',
        message: `Ticket status set to ${newStatus}.`,
        type: 'info'
      });
    }
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const now = new Date().toISOString();
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      senderName: user.name || 'Gowtham S (Admin)',
      senderEmail: user.email || 'gowlearner04@gmail.com',
      senderRole: 'admin',
      avatar: user.avatar,
      message: replyMessage.trim(),
      createdAt: now
    };

    const newMessages = [...selectedTicket.messages, newMsg];
    if (replyStatus === 'Resolved' || replyStatus === 'Closed') {
      newMessages.push({
        id: `msg-sys-${Date.now()}`,
        senderName: 'System Notice',
        senderEmail: 'system@platform.local',
        senderRole: 'admin',
        message: `Your ticket was resolved. Note: Resolved/Closed support tickets are automatically deleted after 1 hr, and you can't reply to this support ID any more. If you have any doubt, please create a new support ticket.`,
        createdAt: now
      });
    }

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: replyStatus,
          updatedAt: now,
          messages: newMessages
        };
      }
      return t;
    });

    saveStoredTickets(updatedTickets);
    setTickets(updatedTickets);
    setReplyMessage('');

    if (addNotification) {
      addNotification({
        title: 'Admin Reply Sent',
        message: `Response sent and ticket status set to ${replyStatus}.`,
        type: 'success'
      });
    }
  };

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
        message: `Support ticket #${ticketToDelete.ticketNumber} removed from the system.`,
        type: 'warning'
      });
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Open</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"><AlertCircle className="w-3 h-3" /> In Progress</span>;
      case 'Resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      case 'Closed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"><CheckCircle2 className="w-3 h-3" /> Closed</span>;
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
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2 sm:p-4 md:p-6 overflow-hidden">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2">
                Ticket System <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">ADMIN PORTAL</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage, prioritize, and respond to incoming support inquiry tickets across the platform.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadTickets}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shrink-0 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2.5 shrink-0">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalTickets}</div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-xs">
          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Open Tickets</div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{openTickets}</div>
        </div>

        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-xs">
          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{inProgressTickets}</div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Resolved</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{resolvedTickets}</div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 min-h-0 pt-1 overflow-hidden">
        {selectedTicket ? (
          
          /* Selected Ticket Detailed View */
          <div className="h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Ticket Header & Admin Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Back to Tickets"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="truncate">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-amber-500">{selectedTicket.ticketNumber}</span>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedTicket.subject}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>User: <b>{selectedTicket.userName}</b> ({selectedTicket.userEmail})</span>
                    <span>•</span>
                    <span>Category: <b>{selectedTicket.category}</b></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {getPriorityBadge(selectedTicket.priority)}
                
                {/* Status Change Selector */}
                <select
                  value={selectedTicket.status}
                  onChange={e => handleUpdateStatus(selectedTicket.id, e.target.value as any)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Open">Status: Open</option>
                  <option value="In Progress">Status: In Progress</option>
                  <option value="Resolved">Status: Resolved</option>
                  <option value="Closed">Status: Closed</option>
                </select>

                <button
                  onClick={() => setTicketToDelete(selectedTicket)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
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
                    className={`flex gap-3 max-w-2xl ${isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAdmin ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : (msg.senderName?.[0] || 'U')}
                    </div>

                    <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {msg.senderName} {isAdmin && <span className="text-amber-500 font-extrabold">(Admin)</span>}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-xl whitespace-pre-wrap ${
                        isAdmin 
                          ? 'bg-amber-500 text-white font-medium shadow-xs' 
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Response Section */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
              {/* Quick Response Templates */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Reply:
                </span>
                {QUICK_RESPONSES.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyMessage(qr)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendAdminReply} className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">Update Status:</span>
                  <select
                    value={replyStatus}
                    onChange={e => setReplyStatus(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Type official admin response to user..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Response
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (

          /* Tickets Search & Table List */
          <div className="h-full flex flex-col space-y-3">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket #, user name, email, or subject..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      statusFilter === st
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets List */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2">
              {filteredTickets.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Tickets Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    No support tickets match the current filter criteria.
                  </p>
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-amber-500">{t.ticketNumber}</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                          {t.subject}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{t.userName} ({t.userEmail})</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-amber-500" /> {t.category}</span>
                        <span>•</span>
                        <span>Updated: {new Date(t.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
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

export default TicketSystemPage;
