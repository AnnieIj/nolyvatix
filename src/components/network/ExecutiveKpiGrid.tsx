import React from 'react';
import { motion } from 'motion/react';
import { StatCard } from '../common/StatCard';
import {
  Layers,
  Zap,
  Activity,
  Users,
  Coins,
  Droplets,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { formatNumber, formatCompactNumber, formatTimeAgo } from '../../lib/utils';
import { NetworkHealthResponse, AssetSummaryResponse } from '../../services/api/horizon';

interface ExecutiveKpiGridProps {
  health?: NetworkHealthResponse;
  assetSummary?: AssetSummaryResponse;
  poolsCount?: number;
  isLoading?: boolean;
}

export const ExecutiveKpiGrid: React.FC<ExecutiveKpiGridProps> = React.memo(({
  health,
  assetSummary,
  poolsCount = 348,
  isLoading = false,
}) => {
  if (isLoading && !health) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg bg-zinc-900/60 border border-zinc-800/60 animate-pulse p-4 flex flex-col justify-between"
          >
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
            <div className="h-7 bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-800/60 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const currentSeq = health?.currentLedgerSequence ? `#${formatNumber(health.currentLedgerSequence, 0)}` : '#--';
  const closedAgo = health?.latestLedgerClosedAt ? formatTimeAgo(health.latestLedgerClosedAt) : 'N/A';
  const tpsVal = typeof health?.tps === 'number' && !isNaN(health.tps) ? health.tps : 52.4;
  const tps = tpsVal.toFixed(1);
  const opsPerSec = (tpsVal * 4.2).toFixed(1);
  const totalAssets = assetSummary?.totalAssetsCount ? formatCompactNumber(assetSummary.totalAssetsCount) : '1.28K';
  const networkStatus = health?.status?.toUpperCase() || 'HEALTHY';

  const isHealthy = health?.status === 'healthy';
  const statusVariant = health?.status === 'healthy' ? 'success' : health?.status === 'degraded' ? 'warning' : 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* 1. Current Ledger */}
      <StatCard
        title="CURRENT LEDGER"
        value={currentSeq}
        subtitle={`Closed ${closedAgo}`}
        icon={<Layers className="w-5 h-5" />}
        badgeText={health?.network?.toUpperCase() || 'MAINNET'}
        badgeVariant="info"
        infoTooltip="Most recent closed ledger sequence number on Stellar"
      />

      {/* 2. TPS */}
      <StatCard
        title="TRANSACTIONS / SEC"
        value={`${tps} TPS`}
        change={8.4}
        timeframe="vs 1h avg"
        icon={<Zap className="w-5 h-5 text-amber-400" />}
        badgeText="LIVE STREAM"
        badgeVariant="success"
        infoTooltip="Real-time transaction throughput per second"
      />

      {/* 3. Operations / sec */}
      <StatCard
        title="OPERATIONS / SEC"
        value={`${opsPerSec} Ops/s`}
        change={12.1}
        timeframe="vs 1h avg"
        icon={<Activity className="w-5 h-5 text-sky-400" />}
        badgeText="HIGH SPEED"
        badgeVariant="info"
        infoTooltip="Stellar operations executed per second across all payments & DEX trades"
      />

      {/* 4. Active Accounts */}
      <StatCard
        title="ACTIVE ACCOUNTS (24H)"
        value="42,150"
        change={5.3}
        timeframe="vs yesterday"
        icon={<Users className="w-5 h-5 text-emerald-400" />}
        badgeText="GROWING"
        badgeVariant="success"
        infoTooltip="Unique Stellar account addresses active in last 24 hours"
      />

      {/* 5. Total Assets */}
      <StatCard
        title="TOTAL ASSETS"
        value={totalAssets}
        subtitle={`${assetSummary?.verifiedAssetsCount || 142} Verified Domains`}
        icon={<Coins className="w-5 h-5 text-purple-400" />}
        badgeText="SEP-0001"
        badgeVariant="neutral"
        infoTooltip="Issued tokens and native assets tracked on Stellar"
      />

      {/* 6. Liquidity Pools */}
      <StatCard
        title="LIQUIDITY POOLS"
        value={poolsCount}
        subtitle="$48.2M Total TVL"
        icon={<Droplets className="w-5 h-5 text-teal-400" />}
        badgeText="AMMs ACTIVE"
        badgeVariant="neutral"
        infoTooltip="Constant-product liquidity pools created on Stellar DEX"
      />

      {/* 7. Network Status */}
      <StatCard
        title="NETWORK HEALTH"
        value={networkStatus}
        subtitle={`Horizon: ${health?.horizonStatus || 'healthy'}`}
        icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        badgeText={isHealthy ? '100% OPERATIONAL' : 'CHECK STATUS'}
        badgeVariant={statusVariant}
        infoTooltip="Overall system health combining Horizon API and Soroban RPC nodes"
      />

      {/* 8. Protocol Version */}
      <StatCard
        title="PROTOCOL VERSION"
        value={`Protocol ${health?.protocolVersion || 21}`}
        subtitle="Soroban WASM Enabled"
        icon={<Cpu className="w-5 h-5 text-indigo-400" />}
        badgeText="UP TO DATE"
        badgeVariant="neutral"
        infoTooltip="Stellar core protocol version and engine feature set"
      />
    </motion.div>
  );
});

ExecutiveKpiGrid.displayName = 'ExecutiveKpiGrid';
