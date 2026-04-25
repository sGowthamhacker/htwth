import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowLeft, ArrowRight, RotateCcw, Home, X, Search, ExternalLink, ShieldCheck, ChevronLeft, ChevronRight, Lock, Users, Activity, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  loading: boolean;
}

const WebBrowserPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { themeStyle, themeMode } = useTheme();
  const isWindows = themeStyle === 'windows';
  const isDark = themeMode === 'dark';

  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com/search?igu=1', loading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [liveVisitors, setLiveVisitors] = useState(Math.floor(Math.random() * 50) + 10);

  useEffect(() => {
    setUrlInput(activeTab.url);
  }, [activeTab.id, activeTab.url]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => Math.max(5, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (newUrl: string) => {
    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = `https://${finalUrl}`;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
      }
    }

    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, url: finalUrl, loading: true, title: finalUrl.split('//')[1]?.split('/')[0] || finalUrl } : t
    ));
    setUrlInput(finalUrl);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigate(urlInput);
  };

  const addTab = () => {
    const newId = Math.random().toString(36).substring(7);
    const newTab: Tab = { id: newId, title: 'New Tab', url: 'https://www.google.com/search?igu=1', loading: false };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleRefresh = () => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: true } : t));
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false } : t));
    }, 500);
  };

  return (
    <div className={`h-full w-full flex flex-col font-sans overflow-hidden select-none ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Tab Bar */}
      <div className={`flex items-center gap-1 px-3 pt-2 ${isDark ? 'bg-slate-950/50' : 'bg-slate-100'}`}>
        {!isWindows && <div className="w-16" />} {/* Mac controls space */}
        <div className="flex-1 flex gap-1 items-end overflow-x-auto no-scrollbar pt-1">
          {tabs.map(tab => (
            <motion.div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              layoutId={tab.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] cursor-pointer text-xs font-medium transition-all group relative
                ${activeTabId === tab.id 
                  ? (isDark ? 'bg-slate-800 text-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]' : 'bg-white text-slate-800 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]') 
                  : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-slate-300' : 'text-slate-500 hover:bg-black/5 hover:text-slate-700')}
                ${isWindows ? 'rounded-t-sm' : 'rounded-t-lg'}
              `}
            >
              <Globe className={`w-3.5 h-3.5 ${activeTabId === tab.id ? 'text-blue-500' : 'text-slate-500'}`} />
              <span className="truncate flex-1">{tab.title}</span>
              <button 
                onClick={(e) => closeTab(e, tab.id)}
                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded-md transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
              >
                <X className="w-3 h-3" />
              </button>
              {activeTabId === tab.id && isWindows && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </motion.div>
          ))}
          <button 
            onClick={addTab}
            className={`p-2 mb-1 rounded-full transition-all ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-black/10'}`}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`flex items-center gap-3 px-4 py-2 border-b ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-1">
          <button className={`p-1.5 rounded-md transition-all active:scale-95 ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className={`p-1.5 rounded-md transition-all active:scale-95 ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={handleRefresh} className={`p-1.5 rounded-md transition-all active:scale-95 ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}>
            <RotateCcw className={`w-4 h-4 ${activeTab.loading ? 'animate-spin-slow' : ''}`} />
          </button>
          <button onClick={() => handleNavigate('https://www.google.com/search?igu=1')} className={`p-1.5 rounded-md transition-all ml-1 ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-black/5'}`}>
            <Home className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 relative group">
          <div className={`
            flex items-center gap-3 px-4 py-1.5 rounded-full transition-all border
            ${isUrlFocused 
              ? 'bg-transparent border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' 
              : (isDark ? 'bg-slate-950/50 border-white/5 group-hover:bg-slate-950 group-hover:border-white/10' : 'bg-slate-100 border-transparent hover:bg-slate-200')}
          `}>
             <div className="flex items-center gap-1.5 flex-shrink-0">
               <Lock className={`w-3 h-3 ${activeTab.url.startsWith('https') ? 'text-emerald-500' : 'text-amber-500'}`} />
               {isUrlFocused && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">HTTPS</span>}
             </div>
            <input
              type="text"
              value={urlInput}
              onFocus={() => setIsUrlFocused(true)}
              onBlur={() => setIsUrlFocused(false)}
              onChange={(e) => setUrlInput(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-xs ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}
              placeholder="Search or enter web address"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
            <div className="hidden sm:flex -space-x-2 mr-2">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-slate-800 bg-slate-700' : 'border-white bg-slate-200'} overflow-hidden`}>
                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                 </div>
               ))}
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isDark ? 'border-slate-800 bg-slate-800 text-slate-400' : 'border-white bg-slate-200 text-slate-600'}`}>
                 +{liveVisitors}
               </div>
            </div>
            <button className="p-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
               <Users className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Browser View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main View */}
        <div className="flex-1 flex flex-col relative bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <iframe
                ref={iframeRef}
                src={activeTab.url}
                className="w-full h-full border-none"
                onLoad={() => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false } : t))}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </motion.div>
          </AnimatePresence>

          {/* Real-time Toast */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className={`backdrop-blur-md border px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-slate-200'}`}
             >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Live: browsing {activeTab.title}
                </span>
             </motion.div>
          </div>
        </div>

        {/* Real-time Activity Sidebar (Collapsible) */}
        <div className={`w-64 border-l hidden lg:flex flex-col ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
           <div className="p-4 border-b border-inherit flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-3 h-3 text-indigo-500" />
                 Live Activity
              </h3>
              <div className="bg-red-500 w-2 h-2 rounded-full animate-pulse" />
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                   <div className="w-8 h-8 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden ring-1 ring-white/10">
                      <img src={`https://i.pravatar.cc/100?u=u${i}`} alt="User" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate">User_{120 + i}</p>
                      <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Browsing {['Kali Linux', 'Writeups', 'Exploits', 'CVEs', 'Docs'][i % 5]}
                      </p>
                      <span className="text-[9px] text-indigo-400 font-medium">Just now</span>
                   </div>
                </div>
              ))}
           </div>
           <div className="p-3 border-t border-inherit">
              <button className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}>
                 <MessageSquare className="w-3 h-3" />
                 Open Browser Chat
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);

export default WebBrowserPage;

