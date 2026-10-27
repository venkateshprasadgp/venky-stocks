import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity } from 'lucide-react';
import { searchStocks } from '../services/api';
import clsx from 'clsx';

interface HeaderProps {
  onSelectTicker: (ticker: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectTicker }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Check market status (IST 09:15 to 15:30, Mon-Fri)
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      // IST is UTC+5:30
      const istTime = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
      const day = istTime.getDay();
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();

      const timeInMinutes = hours * 60 + minutes;
      const isOpen = day >= 1 && day <= 5 && timeInMinutes >= (9 * 60 + 15) && timeInMinutes <= (15 * 60 + 30);
      setIsMarketOpen(isOpen);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 2) {
        try {
          const results = await searchStocks(query);
          setSuggestions(results);
        } catch (error) {
          console.error('Failed to search', error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle outside click for search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const quickTickers = ["NIFTY 50", "BANKNIFTY", "RELIANCE", "HDFCBANK", "CANBK"];

  return (
    <header className="border-b border-slate-800 bg-brand-dark px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Activity className="text-brand-green w-8 h-8" />
        <h1 className="text-xl font-bold tracking-tight text-white">gvp-stocks</h1>
      </div>

      <div className="flex-1 w-full max-w-2xl relative" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search stocks (e.g. CANBK, RELIANCE)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-green transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between"
                onClick={() => {
                  onSelectTicker(s.symbol.replace('.NS', ''));
                  setQuery('');
                  setSuggestions([]);
                }}
              >
                <span className="font-medium text-white">{s.name}</span>
                <span className="text-slate-400 text-sm">{s.symbol}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex gap-2">
          {quickTickers.map(t => (
            <button
              key={t}
              onClick={() => onSelectTicker(t === 'NIFTY 50' ? '^NSEI' : t === 'BANKNIFTY' ? '^NSEBANK' : t)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-300 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className={clsx("w-2 h-2 rounded-full", isMarketOpen ? "bg-brand-green animate-pulse" : "bg-slate-500")} />
          <span className="text-slate-400">{isMarketOpen ? "Market Open" : "Market Closed"}</span>
        </div>
      </div>
    </header>
  );
};
