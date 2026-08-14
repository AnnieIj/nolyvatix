import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { StatusChip } from '../ui/StatusChip';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  RefreshCw,
  Search,
  Layers,
  Clock,
  ArrowRight,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { formatTimeAgo, formatNumber } from '../../lib/utils';

interface LiveLedgerFeedProps {
  ledgers?: any[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  autoRefreshInterval: number;
  setAutoRefreshInterval: (seconds: number) => void;
  onSelectLedger: (sequence: number) => void;
}

export const LiveLedgerFeed: React.FC<LiveLedgerFeedProps> = ({
  ledgers = [],
  isLoading = false,
  isFetching = false,
  onRefresh,
  autoRefreshInterval,
  setAutoRefreshInterval,
  onSelectLedger,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLedgers = ledgers.filter((l) => {
    if (!searchTerm) return true;
    const seqStr = String(l.sequence || '');
    const hashStr = String(l.hash || '').toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    return seqStr.includes(term) || hashStr.includes(term);
  });

  return (
    <GlassCard
      title={
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Live Ledger Feed</span>
        </div>
      }
      subtitle="Real-time stream from Stellar Horizon Node"
      action={
        <div className="flex items-center gap-2">
          {/* Refresh interval dropdown */}
          <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 text-xs">
            <Clock className="w-3 h-3 text-zinc-400" />
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-zinc-200 border-none outline-none text-xs cursor-pointer"
            >
              <option value={3} className="bg-zinc-900 text-white">Auto 3s</option>
              <option value={5} className="bg-zinc-900 text-white">Auto 5s</option>
              <option value={10} className="bg-zinc-900 text-white">Auto 10s</option>
              <option value={0} className="bg-zinc-900 text-white">Pause</option>
            </select>
          </div>

          <StatusChip
            status={autoRefreshInterval > 0 ? 'healthy' : 'offline'}
            label={autoRefreshInterval > 0 ? 'STREAMING' : 'PAUSED'}
          />

          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              isLoading={isFetching}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          )}
        </div>
      }
      className="h-full flex flex-col justify-between"
    >
      {/* Search Input Filter */}
      <div className="mb-3">
        <Input
          placeholder="Filter ledger by sequence # or hash..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-3.5 h-3.5 text-zinc-400" />}
          className="h-8 text-xs bg-zinc-950/60"
        />
      </div>

      {/* Feed List */}
      <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-lg animate-pulse flex items-center justify-between"
            >
              <div className="space-y-1.5 w-1/3">
                <div className="h-4 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
              </div>
              <div className="space-y-1.5 w-1/4 text-right">
                <div className="h-4 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : filteredLedgers.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No closed ledgers found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredLedgers.map((ledger) => (
              <motion.div
                key={ledger.sequence}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectLedger(ledger.sequence)}
                className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg flex items-center justify-between hover:border-sky-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">
                        #{ledger.sequence}
                      </span>
                      <Badge variant="info" size="sm">
                        {ledger.successfulTransactionCount ?? ledger.txs ?? 0} Txs
                      </Badge>
                      {(ledger.failedTransactionCount || 0) > 0 && (
                        <Badge variant="error" size="sm">
                          {ledger.failedTransactionCount} Failed
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(ledger.closedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right font-mono">
                  <div>
                    <div className="text-xs font-semibold text-emerald-400">
                      {ledger.operationCount ?? ledger.ops ?? 0} Ops
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Fee: {ledger.baseFee || 100} stroops
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
        <span>Showing {filteredLedgers.length} latest ledgers</span>
        <span className="text-sky-400 hover:underline cursor-pointer flex items-center gap-1">
          Click row to inspect transactions <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </GlassCard>
  );
};
