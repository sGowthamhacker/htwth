import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition } from '../types';
import SearchIcon from './icons/SearchIcon';

interface SearchBarProps {
  searchableApps: AppDefinition[];
  onSearch: (query: string) => void;
  onAppClick: (appId: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchableApps, onSearch, onAppClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AppDefinition[]>([]);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.trim()) {
      const filtered = searchableApps.filter(app =>
        app.name.toLowerCase().includes(newQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0].id);
    } else if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
      setResults([]);
      setSearchFocused(false);
    }
  };

  const handleResultClick = (appId: string) => {
    onAppClick(appId);
    setQuery('');
    setResults([]);
    setSearchFocused(false);
  };

  return (
    <div ref={searchRef} className="relative flex items-center">
      {isSearchFocused && query.trim().length > 0 && (
        <div className="absolute bottom-[calc(100%+8px)] w-full sm:w-64 md:w-80 max-h-80 overflow-y-auto bg-slate-200/80 dark:bg-slate-900/80 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-lg p-2 animate-slide-up z-[9998]">
          {results.length > 0 ? (
            <ul>
              {results.map(app => (
                <li key={app.id}>
                  <button onClick={() => handleResultClick(app.id)} className="w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    {React.cloneElement(app.icon, { className: 'w-6 h-6' })}
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{app.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-4 text-sm text-slate-500 dark:text-slate-400">No apps found. Press Enter to search all content.</div>
          )}
        </div>
      )}
      <form onSubmit={handleSearchSubmit} className="relative h-12 flex items-center" aria-label="Taskbar Search">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
          <SearchIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setSearchFocused(true)}
          placeholder="Search..."
          className="w-24 sm:w-32 md:w-48 h-12 bg-slate-100/50 dark:bg-slate-900/50 rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 focus:w-32 sm:focus:w-48 md:focus:w-64"
          aria-label="Search Input"
        />
      </form>
    </div>
  );
};

export default SearchBar;
