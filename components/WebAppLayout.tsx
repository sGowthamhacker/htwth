import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, AppDefinition } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import NotificationCenterPage from '../pages/NotificationCenterPage';
import { getCloudinaryUrl } from '../utils/imageService';
import CreateTicketModal from './CreateTicketModal';
import { 
  Monitor, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronRight, 
  Search,
  ShieldCheck,
  Compass,
  Wrench,
  Activity,
  Settings,
  LogOut,
  Bell,
  Home,
  Layers,
  Sparkles,
  Grid,
  LifeBuoy,
  Plus
} from 'lucide-react';

interface WebAppLayoutProps {
  user: User;
  allApps: AppDefinition[];
  currentAppId: string;
  onNavigate: (appId: string) => void;
  onSwitchToDesktopMode: () => void;
  onLogout: () => void;
  unreadNotificationCount: number;
  renderAppContent: (appId: string) => React.ReactNode;
  isPending?: boolean;
  searchQuery?: string;
  onProfileUpdate?: (updatedData: Partial<User>, silent?: boolean) => void | Promise<void>;
}

export const WebAppLayout: React.FC<WebAppLayoutProps> = ({
  user,
  allApps,
  currentAppId,
  onNavigate,
  onSwitchToDesktopMode,
  onLogout,
  unreadNotificationCount,
  renderAppContent,
  isPending = false,
  searchQuery: externalSearchQuery = '',
  onProfileUpdate
}) => {
  const { themeMode, setThemeMode, themeStyle, setThemeStyle, triggerTransition } = useTheme();
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (scrollContainerRef.current) {
      startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
      scrollLeft.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setShowDesktopMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // On mobile default closed, on desktop default open
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Sync internal state with externalSearchQuery prop when URL changes
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      onNavigate(`search/${val.trim()}`);
    } else {
      onNavigate('search');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onNavigate('home');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onNavigate(`search/${searchQuery.trim()}`);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };

  const toggleThemeMode = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    if (onProfileUpdate) {
      onProfileUpdate({
        desktop_preferences: {
          ...(user.desktop_preferences || {}),
          theme_mode: nextMode
        }
      });
    }
  };

  // Normalize active app ID
  const activeAppId = currentAppId && currentAppId !== 'start' && currentAppId !== 'dashboard' && currentAppId !== 'notifications'
    ? currentAppId 
    : 'home';

  const handleSelectApp = (appId: string) => {
    if (appId === 'notifications') {
      setIsNotificationOpen(prev => !prev);
      setIsUserMenuOpen(false);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
      return;
    }
    onNavigate(appId);
    setIsUserMenuOpen(false);
    setIsNotificationOpen(false);
    // Close sidebar on small screens after selecting a page
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Organize apps into clean, comprehensive SaaS product categories
  const sidebarCategories = useMemo(() => {
    const validApps = allApps.filter(app => !['search', 'start', 'blog-viewer'].includes(app.id));

    const coreAppIds = ['home', 'mywork', 'writeup', 'blog', 'bounty'];
    const toolAppIds = ['kali', 'resumeai', 'consistency', 'resources', 'notes', 'todolist', 'docs', 'browser'];
    const systemAppIds = ['chat', 'notifications', 'settings', 'admin', 'ticketsystem', 'supportticket'];

    const coreApps = validApps.filter(a => coreAppIds.includes(a.id));
    const toolApps = validApps.filter(a => toolAppIds.includes(a.id));
    const systemApps = validApps.filter(a => systemAppIds.includes(a.id));
    
    // Catch-all for any other apps in allApps to guarantee zero hidden features
    const claimedIds = new Set([...coreAppIds, ...toolAppIds, ...systemAppIds]);
    const otherApps = validApps.filter(a => !claimedIds.has(a.id));

    const categories = [
      {
        id: 'core',
        title: 'Core Platform',
        icon: <Compass className="w-4 h-4 text-amber-500" />,
        apps: coreApps
      },
      {
        id: 'tools',
        title: 'Security & Tools',
        icon: <Wrench className="w-4 h-4 text-indigo-500" />,
        apps: toolApps
      },
      {
        id: 'community',
        title: 'Community & Account',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
        apps: systemApps
      }
    ];

    if (otherApps.length > 0) {
      categories.push({
        id: 'more',
        title: 'More Features',
        icon: <Layers className="w-4 h-4 text-purple-500" />,
        apps: otherApps
      });
    }

    return categories;
  }, [allApps]);

  // Search filter
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allApps.filter(a => 
      !['search', 'start', 'blog-viewer'].includes(a.id) && 
      (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  }, [allApps, searchQuery]);

  // Primary top header links
  const primaryHeaderLinks = [
    { id: 'home', label: 'Dashboard' },
    { id: 'writeup', label: 'Writeups' },
    { id: 'blog', label: 'Blog' },
    { id: 'kali', label: 'Kali Tools' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Pending Account Notice Banner */}
      {isPending && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex items-center justify-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span className="truncate">Account pending admin approval. Some features restricted.</span>
        </div>
      )}

      {/* FIXED TOP HEADER */}
      <header className="h-14 sm:h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-2.5 sm:px-6 gap-2 sm:gap-4 z-30">
        
        {/* Left: Sidebar Toggle + Brand Logo + Links */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          
          {/* Sidebar Menu Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
            aria-label="Toggle Side Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Name */}
          <button
            onClick={() => handleSelectApp('home')}
            className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 p-0.5 shadow-xs group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[5px] sm:rounded-[6px] flex items-center justify-center text-white font-black text-xs tracking-wider">
                H
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                HTWTH
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
                Security Platform
              </span>
            </div>
          </button>

          {/* Top Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 ml-3 border-l border-slate-200 dark:border-slate-800 pl-3">
            {primaryHeaderLinks.map(link => {
              const isActive = activeAppId === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleSelectApp(link.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Center: Quick Search Bar (Desktop/Tablet) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search platform..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg pl-9 pr-8 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={handleClearSearch} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* New Ticket Button */}
          <button
            onClick={() => setIsCreateTicketModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            title="Create Support Ticket"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsNotificationOpen(!isNotificationOpen);
                setIsUserMenuOpen(false);
              }}
              className={`relative p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                isNotificationOpen
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {isNotificationOpen && (
              <>
                {/* Click outside backdrop / Empty side area click close */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNotificationOpen(false);
                  }} 
                />
                
                {/* Notification Dropdown Panel - Fixed on mobile to stay 100% visible below header */}
                <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-full mt-0 sm:mt-2 w-auto sm:w-[420px] h-[450px] sm:h-[480px] max-h-[80vh] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fade-in origin-top-right">
                  <NotificationCenterPage onNavigateWithinApp={(path) => {
                    onNavigate(path);
                    setIsNotificationOpen(false);
                  }} />
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <img
                src={getCloudinaryUrl(user.avatar, { width: 32, height: 32, radius: 'max' })}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-amber-500/40"
              />
            </button>

            {/* Profile Dropdown */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-60 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 flex flex-col gap-1">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center gap-2.5">
                    <img
                      src={getCloudinaryUrl(user.avatar, { width: 36, height: 36, radius: 'max' })}
                      alt={user.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  <button
                    onClick={() => handleSelectApp('settings')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsCreateTicketModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors text-left cursor-pointer"
                  >
                    <LifeBuoy className="w-4 h-4 text-amber-500" />
                    <span>Create Support Ticket</span>
                  </button>

                  <button
                    onClick={() => {
                        triggerTransition(() => {
                            onSwitchToDesktopMode();
                        });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors text-left cursor-pointer"
                  >
                    <Monitor className="w-4 h-4 text-indigo-500" />
                    <span>Switch to Desktop OS</span>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* BODY AREA (FIXED FRAME) */}
      <div className="flex-1 min-h-0 flex w-full relative overflow-hidden">
        
        {/* COLLAPSIBLE SIDEBAR */}
        <aside
          style={{ willChange: 'transform, width, opacity' }}
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-20 h-full shrink-0 bg-white dark:bg-slate-900 flex flex-col transform-gpu transition-[transform,width,opacity] duration-300 ease-out ${
            isSidebarOpen 
              ? 'w-72 sm:w-80 lg:w-64 translate-x-0 shadow-2xl lg:shadow-none border-r border-slate-200 dark:border-slate-800 opacity-100 pointer-events-auto' 
              : 'w-72 sm:w-80 lg:w-0 -translate-x-full lg:translate-x-0 lg:opacity-0 pointer-events-none lg:pointer-events-none border-r-0 border-transparent overflow-hidden'
          }`}
        >
          {/* Stable-width wrapper to prevent content wrapping/distortion during width collapse animation */}
          <div className="w-72 sm:w-80 lg:w-64 h-full flex flex-col shrink-0 overflow-hidden">
            {/* Mobile Drawer Top Header */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between lg:hidden shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Navigation Menu
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search inside Sidebar for Mobile */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 md:hidden shrink-0">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search tools & apps..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-8 py-2 text-base md:text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Category Tab Controls for Fast Section Filtering */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/20 sticky top-0 z-20 w-full overflow-hidden">
              <div 
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar pb-1 px-1 cursor-grab active:cursor-grabbing select-none"
              >
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-sm border shrink-0 ${
                    activeCategoryFilter === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  All
                </button>
                {sidebarCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border shrink-0 ${
                      activeCategoryFilter === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <span className="shrink-0">{cat.icon}</span>
                    <span>{cat.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Nav Content - Dedicated Vertical Scroll Container */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar hover:custom-scrollbar p-3 space-y-4 pb-12 overflow-x-hidden">
              {filteredApps ? (
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase mb-2">Search Results</p>
                  {filteredApps.map((app) => {
                    const isActive = activeAppId === app.id;
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleSelectApp(app.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="w-4 h-4 flex items-center justify-center">{app.icon}</span>
                        <span className="truncate">{app.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                sidebarCategories
                  .filter(cat => activeCategoryFilter === 'all' || activeCategoryFilter === cat.id)
                  .map((category, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-1.5 px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {category.icon}
                        <span>{category.title}</span>
                      </div>

                      {category.apps.map((app) => {
                        const isActive = activeAppId === app.id;
                        return (
                          <button
                            key={app.id}
                            onClick={() => handleSelectApp(app.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-amber-500 text-white font-bold shadow-xs'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className={`w-4 h-4 flex items-center justify-center shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {app.icon}
                              </span>
                              <span className="truncate">{app.name}</span>
                            </div>

                            {isActive && (
                              <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2 shrink-0">
              <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Status:</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Operational</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay when Sidebar Drawer is Open */}
        <div 
          className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity duration-300 ease-out ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* DEDICATED MAIN SCROLLABLE VIEWPORT */}
        <main className="flex-1 min-w-0 h-full bg-slate-50 dark:bg-slate-950 p-0 sm:p-2 md:p-4 flex flex-col gap-2 transition-[padding,margin] duration-300 ease-out">
          
          {/* Active Page Card Container - Responsive layout with no duplicate borders on mobile */}
          <div className={`w-full mx-auto flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl shadow-none sm:shadow-xs p-3 sm:p-4 md:p-6 flex flex-col transition-[max-width,padding] duration-300 ease-out relative ${
            isSidebarOpen ? 'max-w-7xl' : 'max-w-none lg:px-6'
          }`}>
            {renderAppContent(activeAppId)}
          </div>

          {/* Standard Footer - HIDE ON MOBILE as explicitly requested ("mobile view bottom this all remove ok") */}
          {activeAppId === 'home' && themeStyle === 'webapp' && (
            <footer className={`hidden sm:flex w-full mx-auto mt-0 pt-2 pb-2 text-xs text-slate-500 dark:text-slate-400 flex-col sm:flex-row items-center justify-between gap-3 shrink-0 transition-all duration-300 border-t border-slate-200 dark:border-slate-800 ${
              isSidebarOpen ? 'max-w-7xl' : 'max-w-none lg:px-4'
            }`}>
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="font-bold text-slate-800 dark:text-slate-200">HTWTH Platform</span>
                <span>•</span>
                <span>Hack To Write To Hack</span>
              </div>

              <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4">
                <div 
                  ref={desktopMenuRef}
                  className="relative"
                >
                  <button
                    onClick={() => setShowDesktopMenu(!showDesktopMenu)}
                    className="hover:text-amber-500 transition-colors font-medium flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60"
                  >
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                    Switch to Desktop OS
                  </button>

                  {showDesktopMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-row items-center gap-2 animate-fade-in whitespace-nowrap">
                      <button
                        onClick={() => {
                          setShowDesktopMenu(false);
                          triggerTransition(() => {
                            setThemeStyle('windows', true);
                            if (onProfileUpdate) {
                              onProfileUpdate({ desktop_preferences: { theme_style: 'windows' } });
                            }
                            onSwitchToDesktopMode();
                          });
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                          <Grid className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="leading-tight">Windows OS</div>
                          <div className="text-[10px] text-slate-400 font-normal">Classic Desktop</div>
                        </div>
                      </button>

                      <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800" />

                      <button
                        onClick={() => {
                          setShowDesktopMenu(false);
                          triggerTransition(() => {
                            setThemeStyle('mac', true);
                            if (onProfileUpdate) {
                              onProfileUpdate({ desktop_preferences: { theme_style: 'mac' } });
                            }
                            onSwitchToDesktopMode();
                          });
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="leading-tight">macOS</div>
                          <div className="text-[10px] text-slate-400 font-normal">Dock & Window</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSelectApp('docs')}
                  className="hover:text-amber-500 transition-colors cursor-pointer"
                >
                  Documentation
                </button>
                <button
                  onClick={() => handleSelectApp('copyright')}
                  className="hover:text-amber-500 transition-colors cursor-pointer"
                >
                  Terms & Privacy
                </button>
              </div>
            </footer>
          )}


        </main>

      </div>

      {/* Support Ticket Modal for Normal & Admin Users */}
      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        user={user}
        onTicketCreated={() => {
          setIsCreateTicketModalOpen(false);
          onNavigate('supportticket');
        }}
      />

    </div>
  );
};
