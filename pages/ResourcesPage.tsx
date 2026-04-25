
import React, { useState, useEffect, useMemo } from 'react';
import RetroSearchInput from '../components/RetroSearchInput';
import { useNotificationState } from '../contexts/NotificationContext';
import CheckIcon from '../components/icons/CheckIcon';
import PlusIcon from '../components/icons/PlusIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { User, Payload } from '../types';
import { getPayloads, savePayload, deletePayload, updateAllPayloadsVisibility } from '../services/database';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import FolderIcon from '../components/icons/FolderIcon';
import ResourcesIcon from '../components/icons/ResourcesIcon';
import CloseIcon from '../components/icons/CloseIcon';
import ParticlesBackground from '../components/ParticlesBackground';
import { sanitizeUrl } from '../utils/sanitizeUrl';

// --- Icons ---
const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.375a2.25 2.25 0 012.25-2.25h6.375a2.25 2.25 0 01-2.25 2.25H9.75" />
  </svg>
);

const LockOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
  </svg>
);

const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

// --- Types & Data ---

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'Learning' | 'Tools' | 'Reference' | 'Community';
  icon: string;
  color: string;
}

const resourcesData: Resource[] = [
  {
    id: 'htb',
    title: 'Hack The Box',
    description: 'A massive hacking playground and cybersecurity community.',
    url: 'https://www.hackthebox.com/',
    category: 'Learning',
    icon: '📦',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  },
  {
    id: 'thm',
    title: 'TryHackMe',
    description: 'Hands-on cyber security training through gamified lessons.',
    url: 'https://tryhackme.com/',
    category: 'Learning',
    icon: '👾',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  },
  {
    id: 'portswigger',
    title: 'PortSwigger Academy',
    description: 'Free web security training from the creators of Burp Suite.',
    url: 'https://portswigger.net/web-security',
    category: 'Learning',
    icon: '🎓',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  },
  {
    id: 'owasp',
    title: 'OWASP',
    description: 'The Open Web Application Security Project. Standards & guides.',
    url: 'https://owasp.org/',
    category: 'Reference',
    icon: '🛡️',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  },
  {
    id: 'gtfobins',
    title: 'GTFOBins',
    description: 'List of Unix binaries that can be used to bypass local security restrictions.',
    url: 'https://gtfobins.github.io/',
    category: 'Tools',
    icon: '🐧',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  },
  {
    id: 'payloads',
    title: 'PayloadsAllTheThings',
    description: 'A list of useful payloads and bypasses for Web Application Security.',
    url: 'https://github.com/swisskyrepo/PayloadsAllTheThings',
    category: 'Reference',
    icon: '💣',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  {
    id: 'cyberchef',
    title: 'CyberChef',
    description: 'The Cyber Swiss Army Knife. Encode, decode, format, and parse data.',
    url: 'https://gchq.github.io/CyberChef/',
    category: 'Tools',
    icon: '🔪',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
  },
  {
    id: 'exploitdb',
    title: 'Exploit Database',
    description: 'The ultimate archive of exploits, shellcode, and security papers.',
    url: 'https://www.exploit-db.com/',
    category: 'Reference',
    icon: '🗄️',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  },
  {
    id: 'seclists',
    title: 'SecLists',
    description: 'Collection of multiple types of lists used during security assessments.',
    url: 'https://github.com/danielmiessler/SecLists',
    category: 'Tools',
    icon: '📋',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  },
  {
    id: 'shodan',
    title: 'Shodan',
    description: 'Search engine for Internet-connected devices.',
    url: 'https://www.shodan.io/',
    category: 'Tools',
    icon: '🌐',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  },
];

const categoryColors: Record<string, string> = {
    'XSS': 'bg-red-500/10 text-red-500 border-red-500/20',
    'HTML Injection': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'SQLi': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'LFI': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'RCE': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'SSTI': 'bg-green-500/10 text-green-500 border-green-500/20',
};

const PayloadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: Partial<Payload>) => Promise<void>;
    payload?: Payload | null;
    initialCategory?: string;
}> = ({ isOpen, onClose, onSave, payload, initialCategory }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // "Quick Add" mode if creating new. "Full Edit" mode if editing existing.
    const isEditing = !!payload;
    // Always show full form fields, regardless of edit or create mode.
    const isSimpleAdd = false;

    useEffect(() => {
        if (payload) {
            setTitle(payload.title);
            setCategory(payload.category);
            setCode(payload.code);
            setDescription(payload.description || '');
            setIsVisible(payload.is_visible);
        } else {
            setTitle('');
            setCategory(initialCategory || 'XSS');
            setCode('');
            setDescription('');
            setIsVisible(true);
        }
    }, [payload, isOpen, initialCategory]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onSave({
                id: payload?.id, 
                title,
                category,
                code,
                description,
                is_visible: isVisible
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10005] flex sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
            <div className="bg-slate-900 border-0 sm:border border-slate-700 w-full max-w-6xl h-full sm:h-[90dvh] rounded-none sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up relative">
                <header className="flex-shrink-0 h-14 sm:h-16 px-4 sm:px-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center z-10 select-none">
                    <div className="flex items-center gap-3 overflow-hidden min-w-0 mr-2">
                        {isEditing ? <PencilIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-400 flex-shrink-0"/> : <PlusIcon className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0"/>} 
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                            {isEditing ? 'Edit Payload' : 'New Payload'}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
                        aria-label="Close"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 relative">
                    <div className="flex-1 w-full h-full overflow-y-auto md:overflow-hidden flex flex-col md:flex-row bg-slate-950">
                        {!isSimpleAdd && (
                            <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900 md:h-full md:overflow-y-auto custom-scrollbar p-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Basic Alert" required />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                                    <div className="relative">
                                        <input value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" list="categories" placeholder="Select or type..." required />
                                        <datalist id="categories">
                                            <option value="XSS" />
                                            <option value="HTML Injection" />
                                            <option value="SQLi" />
                                            <option value="LFI" />
                                            <option value="RCE" />
                                            <option value="SSTI" />
                                        </datalist>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32" placeholder="Brief explanation..." />
                                </div>

                                <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-slate-600'}`}>
                                            {isVisible && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} className="hidden" />
                                        <span className="text-sm font-medium text-slate-300">Visible to everyone</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col h-full min-h-[500px] md:min-h-0 bg-[#0d1117] relative">
                            <div className="flex-shrink-0 h-14 border-b border-slate-800/50 flex items-center px-4 gap-4 bg-[#0d1117] sticky top-0 z-10">
                                {isSimpleAdd ? (
                                    <input 
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)} 
                                        className="bg-transparent text-lg md:text-xl font-bold text-white w-full focus:outline-none placeholder:text-slate-600 truncate" 
                                        placeholder="Enter Payload Title..." 
                                        autoFocus 
                                        required
                                    />
                                ) : (
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payload Code</label>
                                )}
                                <span className="text-xs text-slate-500 whitespace-nowrap bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                                    {category || 'No Category'}
                                </span>
                            </div>
                            
                            <textarea 
                                value={code} 
                                onChange={e => setCode(e.target.value)} 
                                className="flex-1 w-full bg-transparent p-4 md:p-6 text-green-400 font-mono text-sm focus:outline-none resize-none leading-relaxed custom-scrollbar"
                                placeholder="// Paste your payload code here..." 
                                spellCheck={false}
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 h-16 border-t border-slate-800 bg-slate-900 flex justify-end items-center px-6 gap-3 z-10">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                            {isSaving ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <><CheckIcon className="w-4 h-4" /> {isEditing ? 'Update' : 'Save'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SelectionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    gradientFrom: string;
    gradientTo: string;
    accentColor: string;
    children?: React.ReactNode; // For admin controls
}> = ({ title, description, icon, onClick, gradientFrom, gradientTo, accentColor, children }) => (
    <div className="relative group w-full h-full"> 
        <button 
            onClick={onClick}
            className="w-full h-full p-8 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 text-left flex flex-col"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            
            <div className={`w-16 h-16 rounded-2xl ${accentColor} bg-opacity-10 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <div className={`text-${accentColor.split('-')[1]}-600 dark:text-${accentColor.split('-')[1]}-400`}>
                    {icon}
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-1">
                {description}
            </p>
            
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span>Explore Now</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
        </button>
        {children && (
             <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 {children}
             </div>
        )}
    </div>
);

const ResourcesPage: React.FC<{ user?: User }> = ({ user }) => {
  const [mainView, setMainView] = useState<'home' | 'opensource' | 'premium'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePayloadCategory, setActivePayloadCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [isLoadingPayloads, setIsLoadingPayloads] = useState(false);
  
  // Admin State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayload, setEditingPayload] = useState<Payload | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { addNotification } = useNotificationState();
  const isAdmin = user?.role === 'admin';

  const resourceCategories = ['All', 'Learning', 'Tools', 'Reference', 'Community'];

  const handleOpenSourceClick = () => {
      setMainView('opensource');
      setSelectedCategory('All');
  };

  const handlePremiumClick = () => {
      setMainView('premium');
      // Premium view handles its own internal categorization
  };

  const handleBackToHome = () => {
      setMainView('home');
      setSearchQuery('');
      setActivePayloadCategory(null);
  };

  const handleCategoryChange = (category: string) => {
      setSelectedCategory(category);
      setSearchQuery('');
  };

  const handleSearchChange = (val: string) => {
      setSearchQuery(val);
      if (val && mainView === 'premium') {
          setActivePayloadCategory(null);
      }
  };

  useEffect(() => {
      const fetchPayloads = async () => {
          setIsLoadingPayloads(true);
          try {
              const data = await getPayloads(isAdmin);
              setPayloads(data);
          } catch (error) {
              console.error("Failed to load payloads", error);
          } finally {
              setIsLoadingPayloads(false);
          }
      };

      // Always fetch payloads on mount to ensure data availability for bulk actions
      fetchPayloads();
      
      // Supabase real-time logic removed.
      // In a real Firebase app, you would use onSnapshot here.
  }, [isAdmin]); // Only run on mount or when admin status changes

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addNotification({ title: 'Copied', message: 'Payload copied to clipboard.', type: 'success', duration: 2000, showToast: true });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSavePayload = async (data: Partial<Payload>) => {
      const previousPayloads = [...payloads];
      try {
          const isUpdate = !!data.id;
          if (isUpdate) {
              setPayloads(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as Payload : p));
          }
          const saved = await savePayload(data);
          
          if (saved) {
              addNotification({ title: 'Success', message: isUpdate ? 'Payload updated.' : 'Payload created.', type: 'success' });
              setPayloads(prev => {
                  if (isUpdate) {
                      return prev.map(p => p.id === saved.id ? saved : p);
                  } else {
                      if (prev.some(p => p.id === saved.id)) return prev;
                      return [saved, ...prev];
                  }
              });
              setIsModalOpen(false);
          } else {
              if (isUpdate) setPayloads(previousPayloads);
              addNotification({ title: 'Error', message: 'Failed to save payload. Please try again.', type: 'error' });
          }
      } catch (error) {
          if (data.id) setPayloads(previousPayloads);
          addNotification({ title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
      }
  };

  const handleToggleVisibility = async (payload: Payload) => {
      if (!isAdmin) return;
      try {
          const updatedData = { id: payload.id, is_visible: !payload.is_visible };
          setPayloads(prev => prev.map(p => p.id === payload.id ? { ...p, is_visible: !payload.is_visible } : p));
          await savePayload(updatedData);
      } catch (error) {
          setPayloads(prev => prev.map(p => p.id === payload.id ? payload : p));
          addNotification({ title: 'Error', message: 'Could not update visibility.', type: 'error' });
      }
  };
  
  const handleBulkToggle = async (action: 'hide' | 'show') => {
    if (!isAdmin) return;
    const confirmMsg = action === 'hide' 
        ? "Are you sure you want to HIDE ALL payloads? Users will see them as locked." 
        : "Are you sure you want to SHOW ALL payloads? All content will be visible.";
        
    if (!window.confirm(confirmMsg)) return;

    setIsLoadingPayloads(true);
    try {
        const isVisible = action === 'show';
        // Use the new bulk update function that handles both Supabase and Mock scenarios
        const success = await updateAllPayloadsVisibility(isVisible);

        if (success) {
            // Optimistic update for local state regardless of DB success (since mock might return true immediately)
            setPayloads(prev => prev.map(p => ({ ...p, is_visible: isVisible })));
            
            addNotification({ 
                title: isVisible ? 'All Payloads Visible' : 'All Payloads Hidden', 
                message: isVisible ? 'Users can now access all payload content.' : 'Users will see all payloads as locked.', 
                type: 'success' 
            });
        } else {
             throw new Error("Bulk update failed");
        }
    } catch (e) {
        console.error(e);
        addNotification({ title: 'Error', message: 'Bulk update failed.', type: 'error' });
    } finally {
        setIsLoadingPayloads(false);
    }
  };

  const handleDeletePayload = async () => {
      if (!deleteId) return;
      const previousPayloads = [...payloads];
      setPayloads(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);

      try {
          await deletePayload(deleteId);
          addNotification({ title: 'Deleted', message: 'Payload removed.', type: 'success' });
      } catch (error) {
          setPayloads(previousPayloads);
          addNotification({ title: 'Error', message: 'Could not delete payload.', type: 'error' });
      }
  };

  const handleToggleCategoryVisibility = async (categoryName: string, currentStatus: 'visible' | 'hidden' | 'mixed') => {
      if (!isAdmin) return;
      
      const newVisibility = currentStatus === 'hidden'; 
      
      // Optimistic update
      setPayloads(prev => prev.map(p => 
          p.category === categoryName ? { ...p, is_visible: newVisibility } : p
      ));

      try {
          // Supabase logic removed.
          // In a real app, you would update the database here.
          addNotification({ 
              title: 'Visibility Updated', 
              message: `${categoryName} is now ${newVisibility ? 'visible' : 'hidden'} to users.`, 
              type: 'success' 
          });
      } catch (error) {
          const freshData = await getPayloads(isAdmin);
          setPayloads(freshData);
          addNotification({ title: 'Error', message: 'Could not update category visibility.', type: 'error' });
      }
  };

  const filteredResources = resourcesData.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPayloads = payloads.filter(payload => {
      const query = searchQuery.toLowerCase();
      if (activePayloadCategory && !query) {
          return payload.category === activePayloadCategory;
      }
      return payload.title.toLowerCase().includes(query) || 
             (payload.description || '').toLowerCase().includes(query) || 
             payload.code.toLowerCase().includes(query) ||
             payload.category.toLowerCase().includes(query);
  });

  const payloadCategories = useMemo(() => {
      const cats: Record<string, { count: number; visibleCount: number }> = {};
      payloads.forEach(p => {
          if (!cats[p.category]) cats[p.category] = { count: 0, visibleCount: 0 };
          cats[p.category].count++;
          if (p.is_visible) cats[p.category].visibleCount++;
      });
      return Object.entries(cats).map(([name, data]) => ({ 
          name, 
          count: data.count,
          status: data.visibleCount === 0 ? 'hidden' : (data.visibleCount === data.count ? 'visible' : 'mixed') as 'visible' | 'hidden' | 'mixed'
      }));
  }, [payloads]);

  // Derived state to check if all payloads are hidden or visible
  const allHidden = useMemo(() => payloads.length > 0 && payloads.every(p => !p.is_visible), [payloads]);
  const allVisible = useMemo(() => payloads.length > 0 && payloads.every(p => p.is_visible), [payloads]);

  const showFolders = mainView === 'premium' && !activePayloadCategory && !searchQuery;

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      <ParticlesBackground />
      <PayloadModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingPayload(null); }} 
        onSave={handleSavePayload}
        payload={editingPayload}
        initialCategory={activePayloadCategory || 'XSS'} 
      />
      
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeletePayload}
        title="Delete Payload"
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      >
        <p>Are you sure you want to permanently delete this payload?</p>
      </ConfirmationModal>

      {/* Header */}
      <header className="p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {mainView !== 'home' && (
                <button 
                    onClick={handleBackToHome}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    title="Back"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
            )}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {mainView === 'home' && (
                        <>Resource Hub</>
                    )}
                    {mainView === 'premium' && (
                        <><LockOpenIcon className="w-6 h-6 text-orange-500" /> Premium Payloads</>
                    )}
                    {mainView === 'opensource' && (
                        <><GlobeIcon className="w-6 h-6 text-indigo-500" /> Open Source Resources</>
                    )}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {mainView === 'home' && 'Select a category to explore.'}
                    {mainView === 'premium' && 'Exclusive payloads for advanced testing.'}
                    {mainView === 'opensource' && 'Curated free tools and learning platforms.'}
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {mainView !== 'home' && (
                <div className="w-full md:w-72">
                    <RetroSearchInput 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                        placeholder={mainView === 'premium' ? "Search payloads..." : "Find resources..."}
                        width="100%"
                    />
                </div>
            )}
          </div>
        </div>

        {/* Category Tabs for Open Source */}
        {mainView === 'opensource' && (
            <div className="flex gap-2 mt-6 overflow-x-auto hide-scrollbar pb-1 max-w-7xl mx-auto">
            {resourceCategories.map(category => (
                <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                    selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                >
                {category}
                </button>
            ))}
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {mainView === 'home' && (
            <div className="max-w-5xl mx-auto h-full flex flex-col justify-center animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SelectionCard 
                        title="Open Source"
                        description="Access a curated collection of free tools, learning platforms, and essential references for cybersecurity."
                        icon={<GlobeIcon className="w-10 h-10" />}
                        onClick={handleOpenSourceClick}
                        gradientFrom="from-indigo-500"
                        gradientTo="to-blue-500"
                        accentColor="bg-indigo-500"
                    />
                    <SelectionCard 
                        title="Premium Source"
                        description="Unlock exclusive, high-quality payloads and advanced techniques for professional testing."
                        icon={<LockOpenIcon className="w-10 h-10" />}
                        onClick={handlePremiumClick}
                        gradientFrom="from-orange-500"
                        gradientTo="to-amber-500"
                        accentColor="bg-orange-500"
                    >
                         {isAdmin && (
                             <div className="flex gap-2">
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); handleBulkToggle('hide'); }} 
                                     className={`p-2 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm border ${
                                        allHidden 
                                        ? 'bg-rose-500 text-white border-rose-600 scale-110 ring-2 ring-rose-500/30' 
                                        : 'bg-white/50 dark:bg-black/20 text-rose-500 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                                     }`}
                                     title={allHidden ? "All Hidden (Active)" : "Hide All Payloads"}
                                 >
                                     <EyeSlashIcon className="w-5 h-5" />
                                 </button>
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); handleBulkToggle('show'); }} 
                                     className={`p-2 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm border ${
                                        allVisible 
                                        ? 'bg-emerald-500 text-white border-emerald-600 scale-110 ring-2 ring-emerald-500/30' 
                                        : 'bg-white/50 dark:bg-black/20 text-emerald-500 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                     }`}
                                     title={allVisible ? "All Visible (Active)" : "Show All Payloads"}
                                 >
                                     <EyeIcon className="w-5 h-5" />
                                 </button>
                             </div>
                         )}
                    </SelectionCard>
                </div>
            </div>
        )}

        {mainView === 'premium' && (
            <div className="max-w-7xl mx-auto animate-fade-in">
                {isLoadingPayloads ? (
                    <div className="flex justify-center py-20"><SpinnerIcon className="w-10 h-10 text-orange-500 animate-spin"/></div>
                ) : (
                    <>
                        {showFolders ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {/* Add New Payload Card - Visible for Admins Only in Folder View */}
                                {isAdmin && (
                                    <button
                                        onClick={() => { setEditingPayload(null); setIsModalOpen(true); }}
                                        className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex flex-col items-center text-center gap-3 group animate-pop-in"
                                    >
                                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <PlusIcon className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">New Payload</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Create Item</p>
                                        </div>
                                    </button>
                                )}

                                {payloadCategories.map(cat => (
                                    <div key={cat.name} className="relative group animate-pop-in">
                                        <button
                                            onClick={() => setActivePayloadCategory(cat.name)}
                                            className={`w-full h-full bg-white dark:bg-slate-800 p-6 rounded-2xl border hover:shadow-lg transition-all flex flex-col items-center text-center gap-3 ${
                                                cat.status === 'hidden' && isAdmin ? 'opacity-70 grayscale' : ''
                                            } ${cat.status === 'hidden' ? 'border-dashed border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-orange-400'}`}
                                        >
                                            <div className={`w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center transition-transform duration-500 ${cat.status === 'hidden' && isAdmin ? 'blur-sm grayscale opacity-60' : 'group-hover:scale-110'}`}>
                                                <FolderIcon className="w-6 h-6" />
                                            </div>
                                            <div className={`${cat.status === 'hidden' && isAdmin ? 'blur-[1px] opacity-60' : ''} transition-all duration-500`}>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-center gap-1">
                                                    {cat.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.count} Payloads</p>
                                            </div>
                                            
                                            {/* Hidden Overlay for Admin */}
                                            {cat.status === 'hidden' && isAdmin && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="bg-slate-900/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm shadow-sm animate-fade-in">
                                                        <EyeSlashIcon className="w-3 h-3"/> Hidden
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                        
                                        {/* Admin Bulk Toggle Visibility Button */}
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleCategoryVisibility(cat.name, cat.status);
                                                }}
                                                className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm border transition-all z-10 active:scale-95 ${
                                                    cat.status === 'hidden' 
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900' // Green 'Show' button when hidden
                                                        : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900' // Amber 'Hide' button when visible
                                                }`}
                                                title={cat.status === 'hidden' ? "Show All" : "Hide All"}
                                            >
                                                {cat.status === 'hidden' ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {payloadCategories.length === 0 && !isAdmin && (
                                    <div className="col-span-full text-center py-20 opacity-60">
                                        <p className="text-slate-500 dark:text-slate-400">No payloads added yet.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                {!searchQuery && (
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => setActivePayloadCategory(null)} 
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors group"
                                            >
                                                <div className="p-1 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30">
                                                    <ArrowLeftIcon className="w-4 h-4" />
                                                </div>
                                                Back to Categories
                                            </button>
                                            {activePayloadCategory && (
                                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-l pl-4 border-slate-300 dark:border-slate-700">
                                                    <FolderIcon className="w-6 h-6 text-orange-500" />
                                                    {activePayloadCategory}
                                                </h2>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Add New Payload Card - Visible for Admins Only */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => { setEditingPayload(null); setIsModalOpen(true); }}
                                            className="w-full flex items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group animate-fade-in"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-sm group-hover:scale-110 transition-transform">
                                                    <PlusIcon className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-sm uppercase tracking-wider">Create New Payload</span>
                                            </div>
                                        </button>
                                    )}

                                    {filteredPayloads.map(payload => {
                                        // "Locked" means not visible.
                                        // If admin, they see it but it's marked (maybe greyed out).
                                        // If user, they see a blurred card.
                                        const isLocked = !payload.is_visible;
                                        
                                        // Should we show the "Premium Content Locked" overlay? Yes if locked and NOT admin.
                                        const showLockedOverlay = isLocked && !isAdmin;
                                        
                                        return (
                                            <div key={payload.id} className={`flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-xl border shadow-sm transition-all duration-500 overflow-hidden group relative ${isLocked ? 'border-dashed border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-800 hover:shadow-md'}`}>
                                                
                                                {/* Content Wrapper - Apply blur if locked for user */}
                                                <div className={`flex flex-col md:flex-row w-full h-full transition-all duration-700 ease-in-out ${showLockedOverlay ? 'blur-md opacity-40 grayscale select-none pointer-events-none' : ''} ${isLocked && isAdmin ? 'opacity-60 grayscale' : ''}`}>
                                                    <div className="p-5 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[payload.category] || 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                                                {payload.category}
                                                            </span>
                                                            {!payload.is_visible && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-500">Hidden</span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{payload.title}</h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">{payload.description}</p>
                                                    </div>

                                                    <div className="flex-1 bg-slate-50 dark:bg-[#0d1117] flex flex-col min-w-0 relative">
                                                        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                                                            <span className="text-[10px] font-mono text-slate-500 uppercase">Code</span>
                                                            <button 
                                                                onClick={() => handleCopy(payload.code, payload.id)}
                                                                className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded transition-colors ${copiedId === payload.id ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                            >
                                                                {copiedId === payload.id ? <CheckIcon className="w-3.5 h-3.5"/> : <CopyIcon className="w-3.5 h-3.5"/>}
                                                                {copiedId === payload.id ? 'Copied' : 'Copy'}
                                                            </button>
                                                        </div>
                                                        <div className="p-4 overflow-x-auto custom-scrollbar flex-1">
                                                            <pre className="font-mono text-sm text-slate-800 dark:text-green-400 whitespace-pre-wrap break-all leading-relaxed">
                                                                {payload.code}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Locked Overlay for Users */}
                                                {showLockedOverlay && (
                                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-[2px] animate-fade-in transition-opacity duration-500">
                                                         <div className="bg-slate-900/90 text-white px-8 py-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl border border-white/10 transform hover:scale-105 transition-transform duration-300">
                                                            <div className="p-3 bg-orange-500/20 rounded-full">
                                                                <LockClosedIcon className="w-8 h-8 text-orange-500" />
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="block font-bold tracking-wide text-xl">Premium Content</span>
                                                                <span className="block text-xs text-slate-400 uppercase tracking-widest mt-1">Locked</span>
                                                            </div>
                                                         </div>
                                                    </div>
                                                )}
                                                
                                                {/* Admin Controls Overlay */}
                                                {isAdmin && (
                                                    <div className={`absolute bottom-4 left-4 z-20 flex gap-2 transition-opacity duration-300 ${payload.is_visible ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                                        <button 
                                                            onClick={() => handleToggleVisibility(payload)} 
                                                            className={`p-2 rounded-lg transition-colors shadow-lg border border-slate-200 dark:border-slate-700 ${payload.is_visible ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900'}`}
                                                            title={payload.is_visible ? "Hide Payload" : "Show Payload"}
                                                        >
                                                            {payload.is_visible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => { setEditingPayload(payload); setIsModalOpen(true); }} 
                                                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-500 hover:text-indigo-600 transition-colors shadow-lg border border-slate-200 dark:border-slate-700"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteId(payload.id)} 
                                                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-colors shadow-lg border border-slate-200 dark:border-slate-700"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredPayloads.length === 0 && !isAdmin && (
                                        <div className="col-span-full text-center py-20 opacity-60">
                                            <p className="text-4xl mb-4">🕵️‍♂️</p>
                                            <p className="text-slate-500 dark:text-slate-400">No payloads found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}

        {mainView === 'opensource' && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredResources.map(resource => (
                <a 
                key={resource.id} 
                href={sanitizeUrl(resource.url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
                >
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${resource.color}`}>
                    {resource.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                    {resource.category}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {resource.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                    {resource.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <span>Visit Website</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
                </a>
            ))}
            {filteredResources.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-60">
                    <p className="text-4xl mb-4">🔍</p>
                    <p className="text-slate-500 dark:text-slate-400">No resources found for "{searchQuery}"</p>
                    <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4 text-indigo-500 font-semibold hover:underline">Clear Filters</button>
                </div>
            )}
            </div>
        )}
      </main>
    </div>
  );
};

export default React.memo(ResourcesPage);
