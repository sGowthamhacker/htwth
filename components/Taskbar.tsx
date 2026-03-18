
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppDefinition, TaskbarPosition, WindowInstance, User, Post } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import UserMenu from './UserMenu';
import TaskbarSearch from './TaskbarSearch';
import SearchIcon from './icons/SearchIcon';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBellIcon from './icons/NotificationBellIcon';
import AppsIcon from './icons/AppsIcon';

interface TaskbarProps {
    position: TaskbarPosition;
    apps: AppDefinition[];
    openWindows: WindowInstance[];
    activeWindowId: string | null;
    onAppClick: (appId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
    onStartClick: () => void;
    isStartMenuOpen: boolean;
    startButtonRef: React.RefObject<HTMLButtonElement>;
    user: User;
    onLogout: () => void;
    onRestart: () => void;
    onOpenSettings: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isAnyWindowMaximized?: boolean;
    allAppsForSearch: AppDefinition[];
    searchablePosts: Post[];
    onSearch: (query: string) => void;
    unreadNotificationCount: number;
    onOpenNotifications: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Clock: React.FC<{isVertical: boolean}> = ({ isVertical }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-xs text-center px-2">
            <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className={isVertical ? 'hidden' : 'hidden sm:block'}>{time.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
        </div>
    );
};

const Separator: React.FC<{ position: TaskbarPosition }> = ({ position }) => {
    const isVertical = position === 'left' || position === 'right';
    if (isVertical) {
        return <div className="h-px w-8 bg-black/10 dark:bg-white/10 my-1"></div>;
    }
    return <div className="w-px h-8 bg-black/10 dark:bg-white/10 mx-1"></div>;
}

const Taskbar: React.FC<TaskbarProps> = ({
    position, apps, openWindows, activeWindowId, onAppClick, onStartClick, isStartMenuOpen,
    startButtonRef, user, onLogout, onRestart, onOpenSettings, isAnyWindowMaximized, allAppsForSearch, searchablePosts, onSearch,
    unreadNotificationCount, onOpenNotifications
}) => {
    const { t } = useTranslation();
    const { themeStyle } = useTheme();
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const [isUserMenuClosing, setUserMenuClosing] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userButtonRef = useRef<HTMLButtonElement>(null);
    
    const [isMobileSearchActive, setMobileSearchActive] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const mobileSearchInputRef = useRef<HTMLInputElement>(null);

    const isVertical = (position === 'left' || position === 'right');

    const handleCloseUserMenu = useCallback(() => {
        if (isUserMenuClosing || !isUserMenuOpen) return;
        setUserMenuClosing(true);
        setTimeout(() => {
            setUserMenuOpen(false);
            setUserMenuClosing(false);
        }, 300);
    }, [isUserMenuClosing, isUserMenuOpen]);

    const handleToggleUserMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (isUserMenuOpen) {
            handleCloseUserMenu();
        } else {
            setUserMenuOpen(true);
        }
    };
    
    const handleCancelMobileSearch = useCallback(() => {
        setMobileSearchActive(false);
        setMobileSearchQuery('');
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isOutsideMenu = userMenuRef.current && !userMenuRef.current.contains(event.target as Node);
            const isOutsideButton = userButtonRef.current && !userButtonRef.current.contains(event.target as Node);
            
            if (isUserMenuOpen && isOutsideMenu && isOutsideButton) {
                handleCloseUserMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen, handleCloseUserMenu]);

    useEffect(() => {
        if (isMobileSearchActive) {
            setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
        }
    }, [isMobileSearchActive]);

    const getTaskbarClasses = (): string => {
        const base = "absolute bg-slate-200/70 dark:bg-slate-900/80 backdrop-blur-xl border-black/10 dark:border-white/10 shadow-lg z-[9999] transition-transform duration-300 ease-in-out";
        
        let positionClasses = '';
        let transformClass = '';
        const shouldHide = isAnyWindowMaximized;
        const mobileHide = isUserMenuOpen;

        switch (position) {
            case 'top':
                positionClasses = `top-0 left-0 right-0 h-[56px] border-b`;
                transformClass = shouldHide ? '-translate-y-full' : (mobileHide ? '-translate-y-full sm:translate-y-0' : 'translate-y-0');
                break;
            case 'left':
                positionClasses = `left-0 top-0 bottom-0 w-[64px] border-r`;
                transformClass = shouldHide ? '-translate-x-full' : (mobileHide ? '-translate-x-full sm:translate-x-0' : 'translate-x-0');
                break;
            case 'right':
                positionClasses = `right-0 top-0 bottom-0 w-[64px] border-l`;
                transformClass = shouldHide ? 'translate-x-full' : (mobileHide ? 'translate-x-full sm:translate-x-0' : 'translate-x-0');
                break;
            case 'bottom':
            default:
                 positionClasses = `bottom-0 left-0 right-0 h-[56px] border-t`;
                 transformClass = shouldHide ? 'translate-y-full' : (mobileHide ? 'translate-y-full sm:translate-y-0' : 'translate-y-0');
                break;
        }
        
        return `${base} ${positionClasses} ${transformClass} p-1.5`;
    };
    
    const handleMobileResultClick = (appId: string, e: React.MouseEvent<HTMLButtonElement>) => {
        onAppClick(appId, e);
        handleCancelMobileSearch();
    };

    const handleMobileSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mobileSearchQuery.trim()) {
            onSearch(mobileSearchQuery.trim());
            handleCancelMobileSearch();
        }
    };

    const { normalizedQuery, filteredApps, filteredPosts, hasResults } = useMemo(() => {
        const query = mobileSearchQuery.toLowerCase().trim();
        if (!query) return { normalizedQuery: '', filteredApps: [], filteredPosts: [], hasResults: false };

        const apps = allAppsForSearch.filter(app => app.name.toLowerCase().includes(query));
        const posts = searchablePosts.filter(post => post.title.toLowerCase().includes(query) || post.tags.some(tag => tag.toLowerCase().includes(query)));
        
        return {
            normalizedQuery: query,
            filteredApps: apps,
            filteredPosts: posts,
            hasResults: apps.length > 0 || posts.length > 0,
        };
    }, [mobileSearchQuery, allAppsForSearch, searchablePosts]);

    const mobileSearchOverlay = (
        <div 
            className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] transition-opacity duration-300 md:hidden ${isMobileSearchActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={handleCancelMobileSearch}
        >
            <div 
                className={`absolute top-0 left-0 right-0 bg-slate-200 dark:bg-slate-900 rounded-b-2xl shadow-2xl p-4 pb-5 transition-transform duration-300 ease-out ${isMobileSearchActive ? 'translate-y-0' : '-translate-y-full'}`}
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '80vh' }}
            >
                <form onSubmit={handleMobileSearchSubmit} className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400 pointer-events-none" />
                        <input
                            ref={mobileSearchInputRef}
                            type="search"
                            value={mobileSearchQuery}
                            onChange={(e) => setMobileSearchQuery(e.target.value)}
                            placeholder={t('start_menu_search_placeholder')}
                            className="w-full h-12 bg-white/80 dark:bg-black/20 rounded-lg pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="button" onClick={handleCancelMobileSearch} className="px-3 h-12 text-sm font-semibold text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                        {t('cancel')}
                    </button>
                </form>

                <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 88px)' }}>
                    {normalizedQuery ? (
                        hasResults ? (
                            <div className="space-y-4">
                                {filteredApps.length > 0 && (
                                    <section>
                                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 px-2 uppercase">{t('start_menu_applications')}</h3>
                                        <ul>
                                            {filteredApps.map(app => (
                                                <li key={app.id}>
                                                    <button onClick={(e) => handleMobileResultClick(app.id, e)} className="w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                        {React.cloneElement(app.icon, { className: 'w-6 h-6' })}
                                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{app.name}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                                {filteredPosts.length > 0 && (
                                    <section>
                                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 px-2 uppercase">{t('start_menu_writeups')}</h3>
                                        <ul>
                                            {filteredPosts.slice(0, 5).map(post => (
                                                <li key={post.id}>
                                                    <button onClick={(e) => handleMobileResultClick('writeup', e)} className="w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{post.title}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{t('start_menu_by')} {post.author.name}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-4 text-sm text-slate-500 dark:text-slate-400">
                                <p>{t('start_menu_no_results')} "{mobileSearchQuery}".</p>
                                <p className="mt-1">{t('start_menu_press_enter')}</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center p-4 text-sm text-slate-500 dark:text-slate-400">
                            <p>{t('start_menu_search_apps_writeups')}</p>
                        </div>
                    )}
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
            </div>
        </div>
    );

    if (themeStyle === 'mac') {
        return (
            <>
                <div className={`fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] transition-transform duration-300 ease-in-out ${isAnyWindowMaximized ? 'translate-y-[calc(100%+8px)]' : 'translate-y-0'}`}>
                    <div className={`flex items-end h-16 md:h-20 bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-black/30 rounded-2xl shadow-lg p-2 gap-2 max-w-[95vw] overflow-x-auto hide-scrollbar`}>
                        <button ref={startButtonRef} onClick={onStartClick} className={`relative w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0 ${isStartMenuOpen ? 'bg-black/20 dark:bg-white/20' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} title="Launchpad">
                            <AppsIcon className={`w-8 h-8 md:w-10 md:h-10`} />
                        </button>
                        <div className="h-full w-px bg-white/20 dark:bg-black/20 mx-1"></div>
                        {apps.map(app => {
                            const running = openWindows.some(win => win.appId === app.id);
                            return (
                                <button key={app.id} onClick={(e) => onAppClick(app.id, e)} className={`relative w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center group flex-shrink-0`} title={app.name}>
                                    <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">{app.name}</div>
                                    {React.cloneElement(app.icon, {className: `w-10 h-10 md:w-12 md:h-12 group-hover:scale-125 transition-transform duration-200 drop-shadow-lg`})}
                                    {running && <div className="absolute bottom-0 w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </button>
                            );
                        })}
                        <div className="h-full w-px bg-white/20 dark:bg-black/20 mx-1"></div>
                        <button ref={userButtonRef} onClick={handleToggleUserMenu} className={`relative w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0 ${isUserMenuOpen ? 'bg-black/20 dark:bg-white/20' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} title="User Menu">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                        </button>
                    </div>
                </div>
                {/* User Menu - Rendered outside taskbar so taskbar can hide without hiding the menu */}
                <div className="z-[10000]" ref={userMenuRef}>
                    {isUserMenuOpen && <UserMenu user={user} onLogout={() => { handleCloseUserMenu(); onLogout(); }} onRestart={() => { handleCloseUserMenu(); onRestart(); }} onOpenSettings={(e) => { handleCloseUserMenu(); onOpenSettings(e); }} position={position} isClosing={isUserMenuClosing}/>}
                </div>
                {mobileSearchOverlay}
            </>
        );
    }

    // Windows Theme Render
    return (
        <>
            <div className={getTaskbarClasses()}>
                <div className={`flex ${isVertical ? 'flex-col justify-between' : 'flex-row items-center'} w-full h-full`}>
                    
                    {/* Left Section */}
                    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-1 flex-shrink-0`}>
                        <button ref={startButtonRef} onClick={onStartClick} className={`w-10 h-10 md:w-12 md:h-12 p-2 rounded-lg transition-colors text-indigo-500 flex items-center justify-center flex-shrink-0 ${isStartMenuOpen ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} title="Start">
                            <SparklesIcon className="w-6 h-6 md:w-7 md:h-7" />
                        </button>
                        <div className="hidden md:block">
                            <TaskbarSearch allApps={allAppsForSearch} searchablePosts={searchablePosts} onOpenApp={(appId, e) => onAppClick(appId, e as any)} position={position} />
                        </div>
                    </div>

                    {/* Middle Section (Scrollable on horizontal) */}
                    <div className={`flex-1 min-w-0 ${isVertical ? 'w-full' : 'h-full'} ${isVertical ? 'py-1' : 'px-1'}`}>
                        <div className={`flex items-center gap-1 w-full h-full ${isVertical ? 'flex-col' : 'overflow-x-auto hide-scrollbar'}`}>
                             {!isVertical && <Separator position={position} />}
                            {apps.map(app => {
                                const running = openWindows.some(win => win.appId === app.id);
                                const active = openWindows.find(w => w.appId === app.id && !w.isMinimized)?.id === activeWindowId;
                                return (
                                    <button key={app.id} onClick={(e) => onAppClick(app.id, e)} className={`relative w-10 h-10 md:w-12 md:h-12 p-2 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0 ${active ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'}`} title={app.name}>
                                        {React.cloneElement(app.icon, {className: 'w-6 h-6 md:w-7 md:h-7'})}
                                        <div className={`absolute rounded-full transition-all duration-200 ${running ? 'opacity-100' : 'opacity-0'} ${active ? 'bg-indigo-500' : 'bg-slate-500 dark:bg-slate-400'} ${isVertical ? 'left-0.5 top-1/2 -translate-y-1/2 w-1 h-4' : 'bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1'}`}></div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-1 flex-shrink-0`}>
                        <Separator position={position} />
                        <button onClick={() => setMobileSearchActive(true)} className="w-10 h-10 md:w-12 md:h-12 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center md:hidden" title="Search">
                            <SearchIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button onClick={(e) => onOpenNotifications(e)} className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 relative" title="Notifications">
                            <NotificationBellIcon className="w-5 h-5 md:w-6 md:h-6" />
                            {unreadNotificationCount > 0 && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-200 dark:border-slate-900"></div>}
                        </button>
                        <div className="relative">
                            <button ref={userButtonRef} onClick={handleToggleUserMenu} className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-lg transition-colors ${isUserMenuOpen ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>
                                <img src={user.avatar} alt={user.name} className="w-7 h-7 md:w-8 md:h-8 rounded-full" />
                            </button>
                        </div>
                        <div className="hidden md:block">
                            <Clock isVertical={isVertical} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* User Menu - Rendered outside taskbar so taskbar can hide without hiding the menu */}
            <div className="z-[10000]" ref={userMenuRef}>
                {isUserMenuOpen && <UserMenu user={user} onLogout={() => { handleCloseUserMenu(); onLogout(); }} onRestart={() => { handleCloseUserMenu(); onRestart(); }} onOpenSettings={(e) => { handleCloseUserMenu(); onOpenSettings(e); }} position={position} isClosing={isUserMenuClosing}/>}
            </div>

            {mobileSearchOverlay}
        </>
    );
};

export default Taskbar;
