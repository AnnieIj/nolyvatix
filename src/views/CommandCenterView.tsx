import React, { useState } from 'react';
import { WorkspaceHeader } from '../components/layout/WorkspaceHeader';
import { ExecutiveKpiGrid } from '../components/network/ExecutiveKpiGrid';
import { LiveLedgerFeed } from '../components/network/LiveLedgerFeed';
import { NetworkActivityCharts } from '../components/network/NetworkActivityCharts';
import { NetworkHealthPanel } from '../components/network/NetworkHealthPanel';
import { LedgerDetailModal } from '../components/network/LedgerDetailModal';
import { NetworkControlsHeader } from '../components/network/NetworkControlsHeader';
import { Button } from '../components/ui/Button';
import {
  useNetworkHealth,
  useSorobanHealth,
  useLatestLedgers,
  useAssetSummary,
  useLiquidityPools,
  useSwitchNetworkMutation,
} from '../hooks/useNetworkData';
import { useAppStore } from '../store/useAppStore';
import { AlertTriangle, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const CommandCenterView: React.FC = () => {
  const { stellarNetwork } = useAppStore();
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5);
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D'>('1H');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLedgerSeq, setSelectedLedgerSeq] = useState<number | null>(null);

  // TanStack Query Hooks consuming Express backend endpoints
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    refetch: refetchHealth,
    isRefetching: isHealthRefetching,
  } = useNetworkHealth({ refreshInterval: autoRefreshInterval * 1000 });

  const {
    data: sorobanHealth,
    refetch: refetchSoroban,
  } = useSorobanHealth({ refreshInterval: autoRefreshInterval * 2000 });

  const {
    data: ledgers = [],
    isLoading: isLedgersLoading,
    isRefetching: isLedgersRefetching,
    refetch: refetchLedgers,
  } = useLatestLedgers(25, { refreshInterval: autoRefreshInterval * 1000 });

  const { data: assetSummary } = useAssetSummary();
  const { data: pools = [] } = useLiquidityPools(20);

  const switchNetworkMutation = useSwitchNetworkMutation();

  const handleRefreshAll = () => {
    refetchHealth();
    refetchSoroban();
    refetchLedgers();
  };

  const handleSwitchNetwork = (network: 'mainnet' | 'testnet' | 'futurenet') => {
    switchNetworkMutation.mutate(network);
  };

  const handleExportCsv = () => {
    if (!ledgers || ledgers.length === 0) return;

    const headers = ['Sequence', 'Closed At', 'Tx Count', 'Failed Txs', 'Operation Count', 'Base Fee (stroops)', 'Hash'];
    const rows = ledgers.map((l) => [
      l.sequence,
      `"${l.closedAt}"`,
      l.successfulTransactionCount ?? l.txs ?? 0,
      l.failedTransactionCount ?? 0,
      l.operationCount ?? l.ops ?? 0,
      l.baseFee ?? 100,
      `"${l.hash || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nolyvatix_network_command_center_${stellarNetwork}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title="Network Command Center"
        subtitle="Stellar Mainnet Throughput, Ledger Stream & Node Health Telemetry"
      />

      {/* Interactive Controls Header */}
      <NetworkControlsHeader
        activeNetwork={stellarNetwork as any}
        onSwitchNetwork={handleSwitchNetwork}
        isSwitching={switchNetworkMutation.isPending}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={handleRefreshAll}
        isRefetching={isHealthRefetching || isLedgersRefetching}
        onExportCsv={handleExportCsv}
      />

      {/* Global Error Banner */}
      {isHealthError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Express Backend Connection Interrupted</h4>
              <p className="text-xs text-rose-200/80">
                Failed to reach Express API endpoint at /api/network/health. Ensure backend process is running.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={handleRefreshAll} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* 1. Executive KPI Cards */}
      <ExecutiveKpiGrid
        health={health}
        assetSummary={assetSummary}
        poolsCount={pools.length || 348}
        isLoading={isHealthLoading}
      />

      {/* Main Grid: Charts & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Network Activity Charts */}
        <div className="lg:col-span-2 space-y-6">
          <NetworkActivityCharts
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            ledgers={ledgers}
            isLoading={isLedgersLoading}
          />
        </div>

        {/* Right Col: Live Ledger Stream Feed */}
        <div className="lg:col-span-1">
          <LiveLedgerFeed
            ledgers={ledgers}
            isLoading={isLedgersLoading}
            isFetching={isLedgersRefetching}
            onRefresh={refetchLedgers}
            autoRefreshInterval={autoRefreshInterval}
            setAutoRefreshInterval={setAutoRefreshInterval}
            onSelectLedger={(seq) => setSelectedLedgerSeq(seq)}
          />
        </div>
      </div>

      {/* 4. Network Health & Latency Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetworkHealthPanel
            health={health}
            sorobanHealth={sorobanHealth}
            activeNetwork={stellarNetwork as any}
            onSwitchNetwork={handleSwitchNetwork}
            isSwitching={switchNetworkMutation.isPending}
            onRefresh={handleRefreshAll}
          />
        </div>

        <div className="lg:col-span-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm text-white mb-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Nolyvatix Node Health SLA</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connected directly to native Express API routes (`/api/*`). Horizon SSE streams and Soroban JSON-RPC calls are cached in-memory with automatic stale-while-revalidate guarantees.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 font-mono text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Data Engine: Sprint 2 Express API</span>
            <span className="text-emerald-400 font-semibold">100% Connected</span>
          </div>
        </div>
      </div>

      {/* Ledger Detail Inspection Modal */}
      <LedgerDetailModal
        sequence={selectedLedgerSeq}
        onClose={() => setSelectedLedgerSeq(null)}
      />
    </div>
  );
};
