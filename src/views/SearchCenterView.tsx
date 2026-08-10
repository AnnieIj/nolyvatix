import React, { useState, useEffect } from 'react';
import { SearchResultItem } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store/useAppStore';
import {
  Search,
  Wallet,
  ArrowRightLeft,
  Cpu,
  Layers,
  FileText,
  Grid3X3,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const SearchCenterView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const { setActiveRoute } = useAppStore();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      executeSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = async (q: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        setResults(json.data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults =
    activeFilter === 'all'
      ? results
      : results.filter((r) => r.type === activeFilter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wallet':
        return <Wallet className="w-4 h-4 text-sky-400" />;
      case 'asset':
        return <ArrowRightLeft className="w-4 h-4 text-emerald-400" />;
      case 'contract':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'ledger':
      case 'transaction':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'dashboard':
        return <Grid3X3 className="w-4 h-4 text-indigo-400" />;
      case 'ai_chat':
        return <Sparkles className="w-4 h-4 text-sky-400" />;
      default:
        return <Search className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-5 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Search className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Universal Search Center</h1>
          <Badge variant="info">Global Index</Badge>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Unified real-time search across Wallets, Assets, Ledgers, Transactions, Soroban Contracts, Pools, Reports, and AI Insights.
        </p>
      </div>

      {/* Input Search Box */}
      <div className="relative max-w-3xl">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search Public Key (G...), Soroban Contract (C...), Ledger #, Asset Code (USDC), Tx Hash, or Report..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 shadow-lg transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin text-xs font-mono">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'wallet', label: 'Wallets' },
          { id: 'asset', label: 'Assets' },
          { id: 'contract', label: 'Soroban Contracts' },
          { id: 'ledger', label: 'Ledgers' },
          { id: 'pool', label: 'Liquidity Pools' },
          { id: 'dashboard', label: 'Dashboards' },
          { id: 'report', label: 'Reports' },
          { id: 'ai_chat', label: 'AI Conversations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? 'bg-sky-500/20 border-sky-500 text-white font-semibold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-3 max-w-3xl font-mono text-xs">
        {filteredResults.length > 0 ? (
          filteredResults.map((item) => (
            <GlassCard
              key={item.id}
              className="p-4 flex items-center justify-between border-zinc-800/80 hover:border-sky-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{item.title}</div>
                  <div className="text-zinc-400 text-xs mt-0.5">{item.subtitle}</div>
                </div>
              </div>

              <a
                href={item.routeUrl || '#'}
                className="p-2 text-zinc-400 hover:text-sky-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </GlassCard>
          ))
        ) : query.trim() ? (
          <GlassCard className="p-8 text-center text-zinc-500">
            {loading ? 'Searching Stellar Data Engine...' : 'No matching entities found for query.'}
          </GlassCard>
        ) : (
          <GlassCard className="p-8 text-center text-zinc-500">
            Start typing above to search across the entire Stellar ecosystem.
          </GlassCard>
        )}
      </div>
    </div>
  );
};
