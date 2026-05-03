import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowLeft, ArrowRight, RotateCcw, Home, X, Lock, ShieldCheck, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { User } from '../types';
import { getCloudinaryUrl } from '../utils/imageService';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  loading: boolean;
  history: string[];
  historyIndex: number;
  refreshCount?: number;
}

const WebBrowserPage: React.FC<{ user?: User; onClose?: () => void; refreshKey?: number }> = ({ user, onClose, refreshKey }) => {
  const { themeStyle, themeMode } = useTheme();
  const isWindows = themeStyle === 'windows';
  const isDark = themeMode === 'dark';

  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com/search?igu=1', loading: false, history: ['https://www.google.com/search?igu=1'], historyIndex: 0 }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUrlInput(activeTab.url);
  }, [activeTab.id, activeTab.url]);

  // Handle external refresh (from window header)
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // Attempt to access a restricted property to check if it's cross-origin
          const _ = iframeRef.current.contentWindow.location.href;
          iframeRef.current.contentWindow.location.reload();
          setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: true } : t));
          return;
        }
      } catch (e) {
        // Cross-origin iframe reload blocked.
      }
      
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: true } : t));
      setTimeout(() => {
          setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false } : t));
      }, 800);
    }
  }, [refreshKey, activeTabId]);

  const handleNavigate = (newUrl: string) => {
    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = `https://${finalUrl}`;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
      }
    }

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId && t.url !== finalUrl) {
        const newHistory = t.history.slice(0, t.historyIndex + 1);
        newHistory.push(finalUrl);
        return { 
          ...t, 
          url: finalUrl, 
          loading: true, 
          title: finalUrl.split('//')[1]?.split('/')[0] || finalUrl,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return t;
    }));
    setUrlInput(finalUrl);
  };

  const goBack = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Attempt native iframe back (will throw SecurityError if cross-origin)
        iframeRef.current.contentWindow.history.back();
        return; // If it didn't throw, we're same origin and it worked
      }
    } catch (e) {
      // Cross-origin iframe back blocked, silently fallback to URL history
    }

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId && t.historyIndex > 0) {
        const newIndex = t.historyIndex - 1;
        const prevUrl = t.history[newIndex];
        return { ...t, url: prevUrl, loading: true, historyIndex: newIndex, title: prevUrl.split('//')[1]?.split('/')[0] || prevUrl, refreshCount: (t.refreshCount || 0) + 1 };
      }
      return t;
    }));
  };

  const goForward = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Attempt native iframe forward (will throw SecurityError if cross-origin)
        iframeRef.current.contentWindow.history.forward();
        return; // If it didn't throw, we're same origin and it worked
      }
    } catch (e) {
      // Cross-origin iframe forward blocked, silently fallback to URL history
    }

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId && t.historyIndex < t.history.length - 1) {
        const newIndex = t.historyIndex + 1;
        const nextUrl = t.history[newIndex];
        return { ...t, url: nextUrl, loading: true, historyIndex: newIndex, title: nextUrl.split('//')[1]?.split('/')[0] || nextUrl, refreshCount: (t.refreshCount || 0) + 1 };
      }
      return t;
    }));
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigate(urlInput);
  };

  const addTab = () => {
    const newId = Math.random().toString(36).substring(7);
    const newTab: Tab = { 
      id: newId, 
      title: 'New Tab', 
      url: 'https://www.google.com/search?igu=1', 
      loading: false,
      history: ['https://www.google.com/search?igu=1'],
      historyIndex: 0
    };
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
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Attempt to access a restricted property to check if it's cross-origin
        const _ = iframeRef.current.contentWindow.location.href;
        iframeRef.current.contentWindow.location.reload();
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: true } : t));
        return;
      }
    } catch (e) {
      // Cross-origin iframe reload blocked.
    }

    // For cross-origin iframes, we cannot read their internal state or force a native reload without resetting the URL. 
    // To prevent "data loss" (losing their place inside the iframe), we simply mock the loading state rather than resetting the iframe src.
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: true } : t));
    setTimeout(() => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false } : t));
    }, 800);
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Tab Bar */}
      <div className={`flex items-center px-2 sm:px-3 pt-2 sm:pt-2.5 flex-shrink-0 select-none ${isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-slate-100 border-b border-slate-200'}`}>
        {!isWindows && <div className="hidden sm:block w-14" />} {/* Mac controls space */}
        <div className="flex-1 flex gap-1 sm:gap-2 items-end overflow-x-auto no-scrollbar pt-1 pb-[1px] px-1 sm:px-0">
          {tabs.map(tab => (
            <motion.div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              layoutId={tab.id}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[80px] sm:min-w-[140px] max-w-[140px] sm:max-w-[240px] cursor-default text-[11px] sm:text-xs font-medium transition-colors group relative flex-shrink-0 overflow-hidden
                ${activeTabId === tab.id 
                  ? (isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800') 
                  : (isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700')}
                ${isWindows ? 'rounded-t-md' : 'rounded-t-xl'}
              `}
            >
              {/* Active Tab Indicators */}
              {activeTabId === tab.id && (
                <>
                  <div className={`absolute left-0 bottom-0 top-0 w-[1px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'} hidden sm:block`} />
                  <div className={`absolute right-0 bottom-0 top-0 w-[1px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'} hidden sm:block`} />
                  <div className={`absolute top-0 left-0 right-0 h-[2px] ${isWindows ? 'bg-blue-500' : 'bg-transparent'} hidden sm:block`} />
                </>
              )}
              
              {/* Icon and Title */}
              <Globe className={`w-3.5 h-3.5 flex-shrink-0 ${activeTabId === tab.id ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="truncate flex-1 text-left">{tab.title}</span>
              
              {/* Close Button */}
              <button 
                onClick={(e) => closeTab(e, tab.id)}
                className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors ${
                  isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200'
                } ${activeTabId === tab.id ? 'opacity-100' : 'sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
          <button 
            onClick={addTab}
            className={`w-7 h-7 sm:w-8 sm:h-8 mb-0.5 sm:mb-1 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 flex-shrink-0 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button 
            onClick={goBack}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors active:scale-95 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={goForward}
            className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-full transition-colors active:scale-95 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={handleRefresh} className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors active:scale-95 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <RotateCcw className={`w-4 h-4 ${activeTab.loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => handleNavigate('https://www.google.com/search?igu=1')} className={`hidden lg:flex w-8 h-8 items-center justify-center rounded-full transition-colors ml-0.5 ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Home className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 relative group min-w-0 flex items-center">
          <div className={`
            flex items-center gap-2 px-3 sm:px-4 tracking-wide h-8 sm:h-9 w-full rounded-full transition-all border
            ${isUrlFocused 
              ? (isDark ? 'bg-slate-900 border-blue-500/50 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' : 'bg-white border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.15)] text-slate-800') 
              : (isDark ? 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900 hover:border-slate-600/50' : 'bg-slate-100 border-transparent hover:bg-slate-200/70')}
          `}>
             <div className="flex items-center gap-1.5 flex-shrink-0">
               <Lock className={`w-3 h-3 ${activeTab.url.startsWith('https') ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-amber-400' : 'text-amber-500')}`} />
             </div>
            <input
              type="text"
              value={urlInput}
              onFocus={() => setIsUrlFocused(true)}
              onBlur={() => setIsUrlFocused(false)}
              onChange={(e) => setUrlInput(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-[12px] sm:text-sm min-w-0 ${isDark ? 'text-slate-200 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
              placeholder="Type a URL..."
              spellCheck={false}
            />
          </div>
        </form>

        {user && (
          <div className="flex items-center gap-2 sm:pl-2 flex-shrink-0">
            <div className="flex flex-col items-end hidden lg:flex px-1">
              <span className={`text-[11px] font-medium leading-none ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user.name}</span>
            </div>
            <div className="relative group flex-shrink-0">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors ${isDark ? 'group-hover:border-slate-500' : 'group-hover:border-slate-300'}`}>
                <img 
                  src={getCloudinaryUrl(user.avatar, { width: 32, height: 32, radius: 'max' })} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Browser View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main View Container */}
        <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 overflow-hidden bg-white"
            >
              <iframe
                ref={iframeRef}
                src={activeTab.url}
                className="absolute top-0 left-0 w-[125%] h-[125%] lg:w-full lg:h-full scale-[0.8] lg:scale-100 origin-top-left border-none bg-white"
                onLoad={() => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false } : t))}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WebBrowserPage;

