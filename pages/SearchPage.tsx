
import React, { useState } from 'react';
import PostCard from '../components/PostCard';
import { AppDefinition, Post, User } from '../types';
import SearchIcon from '../components/icons/SearchIcon';
import TvAntenna from '../components/TvAntenna';

interface SearchPageProps {
  user: User;
  query?: string;
  allApps?: AppDefinition[];
  allPosts?: Post[];
  onOpenApp?: (appId: string, props?: Record<string, any>, e?: React.MouseEvent<HTMLElement>) => void;
  onClose?: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ user, query = '', allApps = [], allPosts = [], onOpenApp = (appId, props, e) => {}, onClose = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState(query);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filteredPosts = allPosts.filter(post =>
    normalizedQuery && (
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.content.toLowerCase().includes(normalizedQuery) ||
      post.author.name.toLowerCase().includes(normalizedQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
    )
  );

  const filteredApps = allApps.filter(app =>
    normalizedQuery && app.name.toLowerCase().includes(normalizedQuery)
  );
  
  const handleOpenApp = (path: string, e: React.MouseEvent<HTMLElement>) => {
    onOpenApp(path, {}, e);
    onClose();
  };

  const hasResults = filteredApps.length > 0 || filteredPosts.length > 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 h-full flex flex-col">
      <div className="relative flex-shrink-0">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input 
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for apps, writeups, and more..."
          className="modern-input w-full text-lg pl-12 pr-4"
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {normalizedQuery ? (
          <>
            {hasResults ? (
              <div className="space-y-8 animate-fade-in">
                {filteredApps.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Applications</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredApps.map(app => (
                        <button 
                          key={app.id} 
                          onClick={(e) => handleOpenApp(app.id, e)} 
                          className="flex items-center gap-4 p-4 rounded-lg text-left bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/50"
                        >
                          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-300 dark:bg-slate-700 flex-shrink-0">
                              {React.cloneElement(app.icon, {className: 'w-5 h-5'})}
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {filteredPosts.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Content</h2>
                    <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-1 lg:grid-cols-2">
                      {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} currentUser={user} onClick={(e) => handleOpenApp(`${post.type}/${post.id}`, e)} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full animate-fade-in pb-20">
                <div className="transform scale-[0.6] sm:scale-75 md:scale-90 origin-center">
                    <TvAntenna message="NO DATA" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-lg mt-4 font-mono text-center px-4">
                    No results found for <br/><span className="text-slate-800 dark:text-slate-200 font-bold">"{searchQuery}"</span>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 animate-fade-in h-full flex flex-col justify-center items-center">
              <SearchIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Search for apps and writeups.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchPage);
