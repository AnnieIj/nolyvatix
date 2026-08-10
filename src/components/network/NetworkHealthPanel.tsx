import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StatusChip } from '../ui/StatusChip';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Server, Globe, Cpu, Radio, Activity, RefreshCw } from 'lucide-react';
import { NetworkHealthResponse } from '../../services/api/horizon';

interface NetworkHealthPanelProps {
  health?: NetworkHealthResponse;
  sorobanHealth?: any;
  activeNetwork: 'mainnet' | 'testnet' | 'futurenet';
  onSwitchNetwork: (network: 'mainnet' | 'testnet' | 'futurenet') => void;
  isSwitching?: boolean;
  onRefresh?: () => void;
}

export const NetworkHealthPanel: React.FC<NetworkHealthPanelProps> = ({
  health,
  sorobanHealth,
  activeNetwork,
  onSwitchNetwork,
  isSwitching = false,
  onRefresh,
}) => {
  const apiLatencyMs = health?._latencyMs || 42;
  const rpcLatencyMs = sorobanHealth?.rpcLatencyMs || 68;

  const networks = [
    {
      id: 'mainnet' as const,
      name: 'Mainnet',
      subtitle: 'Public Production Cluster',
      status: activeNetwork === 'mainnet' ? health?.status || 'healthy' : 'healthy',
      horizonUrl: 'https://horizon.stellar.org',
      sorobanUrl: 'https://soroban-rpc.mainnet.stellar.org',
    },
    {
      id: 'testnet' as const,
      name: 'Testnet',
      subtitle: 'SDF Test Environment',
      status: activeNetwork === 'testnet' ? health?.status || 'healthy' : 'healthy',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      sorobanUrl: 'https://soroban-testnet.stellar.org',
    },
    {
      id: 'futurenet' as const,
      name: 'Futurenet',
      subtitle: 'Experimental Features',
      status: 'healthy',
      horizonUrl: 'https://horizon-futurenet.stellar.org',
      sorobanUrl: 'https://rpc-futurenet.stellar.org',
    },
  ];

  return (
    <GlassCard
      title={
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Network Health & Latency</span>
        </div>
      }
      subtitle="Node Cluster Status & Endpoint Diagnostics"
      action={
        onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Ping Nodes
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* Latency Cards Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Horizon API Ping</span>
              <div className="text-lg font-bold font-mono text-emerald-400">{apiLatencyMs} ms</div>
            </div>
            <Globe className="w-5 h-5 text-emerald-500/60" />
          </div>

          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Soroban RPC Ping</span>
              <div className="text-lg font-bold font-mono text-sky-400">{rpcLatencyMs} ms</div>
            </div>
            <Cpu className="w-5 h-5 text-sky-500/60" />
          </div>
        </div>

        {/* Network Status List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider block">
            Target Stellar Clusters
          </span>

          {networks.map((net) => {
            const isActive = activeNetwork === net.id;
            return (
              <div
                key={net.id}
                className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-sm'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">{net.name}</span>
                    {isActive && <Badge variant="info" size="sm">ACTIVE</Badge>}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">{net.subtitle}</span>
                </div>

                <div className="flex items-center gap-3">
                  <StatusChip
                    status={net.status === 'down' ? 'offline' : (net.status as any)}
                    label={net.status.toUpperCase()}
                  />
                  {!isActive && (
                    <Button
                      variant="glass"
                      size="sm"
                      isLoading={isSwitching}
                      onClick={() => onSwitchNetwork(net.id)}
                      className="text-xs"
                    >
                      Switch
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
