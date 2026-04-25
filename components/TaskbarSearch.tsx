
import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition, Post, TaskbarPosition } from '../types';

interface TaskbarSearchProps {
  allApps: AppDefinition[];
  searchablePosts: Post[];
  onOpenApp: (appId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  position: TaskbarPosition;
}

const TaskbarSearch: React.FC<TaskbarSearchProps> = ({ allApps, searchablePosts, onOpenApp, position }) => {
  const [query, setQuery] = useState('');
  const [isPanelOpen, setPanelOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.trim()) {
      setPanelOpen(true);
    } else {
      setPanelOpen(false);
    }
  };

  const handleFocus = () => {
    if (query.trim()) {
      setPanelOpen(true);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          if (query.trim()) {
              // Default action: open search app with query
              onOpenApp(`search/${encodeURIComponent(query.trim())}`, e as unknown as React.MouseEvent<HTMLButtonElement>);
              setQuery('');
              setPanelOpen(false);
          }
      }
  }

  const handleResultClick = (appId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenApp(appId, e);
    setQuery('');
    setPanelOpen(false);
  };
  
  const normalizedQuery = query.toLowerCase().trim();
  const filteredApps = normalizedQuery ? allApps.filter(app => app.name.toLowerCase().includes(normalizedQuery)) : [];
  const filteredPosts = normalizedQuery ? searchablePosts.filter(post => 
    post.title.toLowerCase().includes(normalizedQuery) || 
    post.author.name.toLowerCase().includes(normalizedQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  ) : [];
  const hasResults = filteredApps.length > 0 || filteredPosts.length > 0;
  
  const panelPositionClasses = () => {
      switch (position) {
          case 'top': return 'top-full mt-2 left-0';
          case 'left': return 'left-full ml-2 top-0';
          case 'right': return 'right-full mr-2 top-0';
          case 'bottom':
          default: return 'bottom-full mb-2 left-0';
      }
  };

  return (
    <div ref={searchRef} className="relative flex items-center z-50">
      <style>{`
        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: none;
          outline: none;
          padding: 18px 16px;
          background-color: transparent;
          cursor: pointer;
          transition: all .5s ease-in-out;
          color: #333;
        }
        .dark .search-input {
            color: #fff;
        }

        .search-input::placeholder {
          color: transparent;
        }

        .search-input:focus::placeholder {
          color: rgb(131, 128, 128);
        }
        .dark .search-input:focus::placeholder {
          color: rgb(156, 163, 175);
        }

        .search-input:focus, .search-input:not(:placeholder-shown) {
          background-color: #fff;
          border: 1px solid rgb(98, 0, 255);
          width: 290px;
          cursor: text;
          padding: 18px 16px 18px 40px;
        }
        .dark .search-input:focus, .dark .search-input:not(:placeholder-shown) {
            background-color: #1e293b; /* Slate 800 */
            border-color: #818cf8; /* Indigo 400 */
        }

        .search-icon {
          position: absolute;
          left: 0;
          top: 0;
          height: 40px;
          width: 40px;
          background-color: #fff;
          border-radius: 10px;
          z-index: -1;
          fill: rgb(98, 0, 255);
          border: 1px solid rgb(98, 0, 255);
        }
        .dark .search-icon {
            background-color: #1e293b;
            fill: #818cf8;
            border-color: #818cf8;
        }

        .search-input:hover + .search-icon {
          transform: rotate(360deg);
          transition: .2s ease-in-out;
        }

        .search-input:focus + .search-icon, .search-input:not(:placeholder-shown) + .search-icon {
          z-index: 0;
          background-color: transparent;
          border: none;
        }
      `}</style>

      {isPanelOpen && query.trim() && (
        <div className={`absolute ${panelPositionClasses()} w-full min-w-[290px] sm:w-80 max-h-96 overflow-y-auto bg-slate-200/90 dark:bg-slate-900/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-lg p-2 animate-slide-up z-[9998]`}>
           {hasResults ? (
               <div className="space-y-4">
                 {filteredApps.length > 0 && (
                     <section>
                         <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 px-2 uppercase">Applications</h3>
                         <ul>
                            {filteredApps.map(app => (
                                <li key={app.id}>
                                    <button onClick={(e) => handleResultClick(app.id, e)} className="w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
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
                         <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 px-2 uppercase">Writeups</h3>
                         <ul>
                            {filteredPosts.slice(0, 5).map(post => (
                                <li key={post.id}>
                                    <button onClick={(e) => handleResultClick('writeup', e)} className="w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{post.title}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">By {post.author.name}</div>
                                    </button>
                                </li>
                            ))}
                         </ul>
                     </section>
                 )}
               </div>
           ) : (
                <div className="text-center p-4 text-sm text-slate-500 dark:text-slate-400">No results for "{query}"</div>
           )}
        </div>
      )}
      
      <div className="input-container">
        <input 
            placeholder="Search something..." 
            className="search-input" 
            name="text" 
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="search-icon">
            <g strokeWidth={0} id="SVGRepo_bgCarrier" />
            <g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier" />
            <g id="SVGRepo_iconCarrier"> 
                <rect fill="white" className="opacity-0" /> 
                <path d="M7.25007 2.38782C8.54878 2.0992 10.1243 2 12 2C13.8757 2 15.4512 2.0992 16.7499 2.38782C18.06 2.67897 19.1488 3.176 19.9864 4.01358C20.824 4.85116 21.321 5.94002 21.6122 7.25007C21.9008 8.54878 22 10.1243 22 12C22 13.8757 21.9008 15.4512 21.6122 16.7499C21.321 18.06 20.824 19.1488 19.9864 19.9864C19.1488 20.824 18.06 21.321 16.7499 21.6122C15.4512 21.9008 13.8757 22 12 22C10.1243 22 8.54878 21.9008 7.25007 21.6122C5.94002 21.321 4.85116 20.824 4.01358 19.9864C3.176 19.1488 2.67897 18.06 2.38782 16.7499C2.0992 15.4512 2 13.8757 2 12C2 10.1243 2.0992 8.54878 2.38782 7.25007C2.67897 5.94002 3.176 4.85116 4.01358 4.01358C4.85116 3.176 5.94002 2.67897 7.25007 2.38782ZM9 11.5C9 10.1193 10.1193 9 11.5 9C12.8807 9 14 10.1193 14 11.5C14 12.8807 12.8807 14 11.5 14C10.1193 14 9 12.8807 9 11.5ZM11.5 7C9.01472 7 7 9.01472 7 11.5C7 13.9853 9.01472 16 11.5 16C12.3805 16 13.202 15.7471 13.8957 15.31L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L15.31 13.8957C15.7471 13.202 16 12.3805 16 11.5C16 9.01472 13.9853 7 11.5 7Z" clipRule="evenodd" fillRule="evenodd" /> 
            </g>
        </svg>
      </div>
    </div>
  );
};

export default TaskbarSearch;
