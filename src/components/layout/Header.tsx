'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your purchase order operations' },
  '/purchase-orders': { title: 'Purchase Orders', subtitle: 'Manage and track all purchase orders' },
  '/purchase-orders/new': { title: 'New Purchase Order', subtitle: 'Create a new purchase order' },
  '/suppliers': { title: 'Suppliers', subtitle: 'Manage vendor information and performance' },
  '/inventory': { title: 'Inventory', subtitle: 'Track stock levels and optimize inventory' },
  '/shipments': { title: 'Shipments', subtitle: 'Monitor incoming shipments and deliveries' },
  '/analytics': { title: 'Analytics', subtitle: 'Procurement insights and performance reports' },
  '/blockchain': { title: 'Blockchain Explorer', subtitle: 'View blockchain transactions and audit trail' },
  '/settings': { title: 'Settings', subtitle: 'System configuration and preferences' },
};

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  status: string;
  type: 'order' | 'supplier' | 'inventory';
  href: string;
}

interface SearchResults {
  orders: SearchResult[];
  suppliers: SearchResult[];
  inventory: SearchResult[];
}

const typeIcons: Record<string, React.ReactNode> = {
  order: (
    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  supplier: (
    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  inventory: (
    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  ),
};

const typeLabels: Record<string, string> = {
  order: 'Purchase Order',
  supplier: 'Supplier',
  inventory: 'Inventory',
};

export interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageInfo = pageTitles[pathname] || { title: 'Page', subtitle: '' };

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setOpen(true);
      }
    } catch {
      // Silently handle errors
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [pathname]);

  const totalResults = results
    ? results.orders.length + results.suppliers.length + results.inventory.length
    : 0;

  const allResults: SearchResult[] = results
    ? [...results.orders, ...results.suppliers, ...results.inventory]
    : [];

  const handleResultClick = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pageInfo.title}</h1>
            <p className="text-sm text-gray-500 hidden sm:block">{pageInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div ref={containerRef} className="relative hidden md:block">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-400 w-64 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:bg-white focus-within:border focus-within:border-primary-300 transition-all">
              {searching ? (
                <svg className="w-4 h-4 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (results && totalResults > 0) setOpen(true); }}
                placeholder="Search orders, suppliers..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[420px] overflow-y-auto animate-fade-in">
                {totalResults === 0 && !searching ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {allResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                      >
                        <span className="shrink-0">{typeIcons[result.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{result.label}</p>
                          <p className="text-xs text-gray-400 truncate">{typeLabels[result.type]} · {result.sublabel}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                          {result.status?.replace(/_/g, ' ')}
                        </span>
                      </button>
                    ))}
                    <div className="px-4 py-2 border-t border-gray-100 mt-1">
                      <p className="text-xs text-gray-400">{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Blockchain status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Blockchain Connected
          </div>
        </div>
      </div>
    </header>
  );
}
