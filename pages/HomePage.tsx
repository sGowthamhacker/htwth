
import React, { useState } from 'react';
import { User, Post } from '../types';
import PostCard from '../components/PostCard';
import WriteupIcon from '../components/icons/WriteupIcon';
import ChatIcon from '../components/icons/ChatIcon';
import BlogIcon from '../components/icons/BlogIcon';
import RetroSearchInput from '../components/RetroSearchInput';
import ParticlesBackground from '../components/ParticlesBackground';

interface HomePageProps {
  user: User;
  writeups: Post[];
  isPending?: boolean;
  onOpenApp?: (appId: string, props?: Record<string, any>, e?: React.MouseEvent<HTMLElement>) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, writeups, isPending = false, onOpenApp = (appId, props, e) => {} }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    { id: 'writeup', name: 'Browse Writeups', icon: <WriteupIcon className="w-6 h-6 text-indigo-500" />, desc: 'Explore community findings.' },
    { id: 'blog', name: 'Read our Blog', icon: <BlogIcon className="w-6 h-6 text-cyan-500" />, desc: 'Get news and updates.' },
    { id: 'chat', name: 'Community Chat', icon: <ChatIcon className="w-6 h-6 text-emerald-500" />, desc: 'Talk with Sparky AI.' },
  ];
  
  const handleSearch = (value: string) => {
      setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchQuery.trim()) {
          onOpenApp('search', { deepLinkInfo: searchQuery }, undefined);
      }
  };

  if (isPending) {
    return (
        <div className="space-y-8 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center h-full text-center relative">
            <ParticlesBackground />
            <div className="relative z-10 flex flex-col items-center w-full">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome, {user.name}! 👋</h1>
                <div className="max-w-2xl mx-auto p-6 bg-amber-100 dark:bg-amber-900/40 rounded-lg border border-amber-300 dark:border-amber-700 mt-8">
                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">Your Account is Pending Approval</h2>
                    <p className="mt-2 text-amber-700 dark:text-amber-300">
                        An administrator is reviewing your account. Once approved, you will have full access to Writeups, the Blog, and Community Chat. In the meantime, feel free to explore your Portfolio and Settings.
                    </p>
                </div>
            </div>
        </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative">
      <ParticlesBackground />
      <div className="space-y-10 p-4 sm:p-6 md:p-8 pb-32 relative z-10">
        <header className="space-y-6">
          <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome, {user.name}! 👋</h1>
              <p className="max-w-2xl text-slate-500 dark:text-slate-400 mt-2">
                Here's what's new in the community. Jump back in or start something new.
              </p>
          </div>
          
          <div className="w-full sm:max-w-md relative z-10">
             <RetroSearchInput 
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleSearchSubmit}
                placeholder="Search everything..."
                width="100%"
             />
          </div>
        </header>

        <section>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map(action => (
                    <button key={action.id} onClick={(e) => onOpenApp(action.id, {}, e)} className="flex items-center gap-4 p-4 rounded-lg text-left bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <div>{action.icon}</div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{action.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{action.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </section>

        <section>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Writeups</h2>
              <button onClick={(e) => onOpenApp('writeup', {}, e)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  View All &rarr;
              </button>
            </div>
            {/* Added grid-cols-1 and min-w-0 to strictly constrain width on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 min-w-0">
              {writeups.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} currentUser={user} onClick={(e) => onOpenApp('writeup', {}, e)} />
              ))}
            </div>
        </section>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
