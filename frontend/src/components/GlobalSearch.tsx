'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchService } from '@/services/search.service';
import { SearchResultResponse } from '@/types/search.types';
import Link from 'next/link';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const data = await SearchService.searchGlobal(query);
        setResults(data);
      } catch (error) {
        console.error('Failed to search', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-48 sm:w-64 border border-transparent focus:border-red-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <span>Search...</span>
        <span className="ml-auto flex-none text-xs font-semibold border border-gray-300 dark:border-gray-500 rounded px-1">Ctrl K</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center px-4 py-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white px-3 py-2 text-lg outline-none placeholder-gray-400"
                  placeholder="Search projects, members, or documents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">ESC</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              )}
              
              {!loading && results && (
                <div className="space-y-4 py-2">
                  {results.projects.length === 0 && results.users.length === 0 && results.documents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No results found for "{query}"</div>
                  )}

                  {results.projects.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</div>
                      <div className="mt-1">
                        {results.projects.map(p => (
                          <Link key={p.id} href={`/projects/${p.id}`} onClick={() => setIsOpen(false)}>
                            <div className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</div>
                                <div className="text-xs text-gray-500 truncate max-w-md">{p.description}</div>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{p.myRole}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Members</div>
                      <div className="mt-1">
                        {results.users.map(u => (
                          <div key={u.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{u.fullName || 'No Name'}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.documents.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Documents</div>
                      <div className="mt-1">
                        {results.documents.map(d => (
                          <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
                            <div className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer flex items-center space-x-3">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</div>
                                <div className="text-xs text-gray-500">Project ID: {d.projectId}</div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!query.trim() && (
                <div className="text-center py-10 text-gray-500 text-sm">
                  Start typing to search across your workspace...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
