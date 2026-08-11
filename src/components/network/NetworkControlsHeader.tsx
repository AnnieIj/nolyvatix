import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  RefreshCw,
  Download,
  Search,
  Globe,
  Clock,
  Filter,
} from 'lucide-react';

interface NetworkControlsHeaderProps {
  activeNetwork: 'mainnet' | 'testnet' | 'futurenet';
  onSwitchNetwork: (net: 'mainnet' | 'testnet' | 'futurenet') => void;
  isSwitching?: boolean;
  timeRange: '1H' | '6H' | '24H' | '7D';
  setTimeRange: (range: '1H' | '6H' | '24H' | '7D') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isRefetching?: boolean;
  onExportCsv: () => void;
}

export const NetworkControlsHeader: React.FC<NetworkControlsHeaderProps> = React.memo(({
  activeNetwork,
  onSwitchNetwork,
  isSwitching = false,
  timeRange,
  setTimeRange,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefetching = false,
  onExportCsv,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 backdrop-blur-xl space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Network Cluster Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline" id="cluster-label">Cluster:</span>
          <div
            role="group"
            aria-labelledby="cluster-label"
            aria-label="Stellar network cluster selector"
            className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800"
          >
            {(['mainnet', 'testnet', 'futurenet'] as const).map((net) => (
              <button
                key={net}
                disabled={isSwitching}
                onClick={() => onSwitchNetwork(net)}
                aria-pressed={activeNetwork === net}
                aria-label={`Switch to ${net}`}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 ${
                  activeNetwork === net
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {net.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md">
          <label htmlFor="network-controls-search" className="sr-only">Search by ledger sequence, transaction hash, or account address</label>
          <Input
            id="network-controls-search"
            placeholder="Search by ledger #, transaction hash, or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />}
            className="h-8 text-xs bg-zinc-950/80"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* Time range picker */}
          <div
            role="group"
            aria-label="Chart time range selector"
            className="hidden sm:flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono"
          >
            {(['1H', '6H', '24H', '7D'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                aria-pressed={timeRange === range}
                aria-label={`Show data for last ${range}`}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 ${
                  timeRange === range
                    ? 'bg-zinc-800 text-sky-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefetching}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} aria-hidden="true" />}
            aria-label={isRefetching ? 'Refreshing network data...' : 'Refresh network data'}
            className="text-xs"
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
            aria-label="Export ledger data as CSV file"
            className="text-xs"
          >
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
});

NetworkControlsHeader.displayName = 'NetworkControlsHeader';
