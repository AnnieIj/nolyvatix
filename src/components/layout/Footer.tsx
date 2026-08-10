import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StatusChip } from '../ui/StatusChip';
import { Shield, GitBranch, Terminal, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { networkTelemetry, stellarNetwork } = useAppStore();

  return (
    <footer className="h-9 border-t border-zinc-800/80 bg-zinc-950 px-4 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <StatusChip status={networkTelemetry.horizonStatus} label={`HORIZON REST (${stellarNetwork.toUpperCase()})`} />
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <StatusChip status={networkTelemetry.sorobanStatus} label="SOROBAN RPC" />
        </div>
        <div className="hidden md:flex items-center gap-2 text-zinc-400">
          <span>Close Speed:</span>
          <span className="text-white font-medium">{networkTelemetry.avgLedgerCloseSeconds}s</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden lg:inline text-zinc-500">
          Nolyvatix Open-Source Enterprise Architecture v1.0.0
        </span>
        <a
          href="https://stellar.org"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-colors flex items-center gap-1 text-sky-400"
        >
          <span>Stellar Ecosystem</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
};
