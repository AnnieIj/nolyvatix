import React from 'react';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { AlertOctagon, RefreshCw, Activity } from 'lucide-react';

interface ServerErrorViewProps {
  error?: Error | null;
  onRetry?: () => void;
}

export const ServerErrorView: React.FC<ServerErrorViewProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <GlassCard className="max-w-lg w-full text-center p-8 space-y-6 border-zinc-800 bg-zinc-950/90 shadow-2xl">
        <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
            HTTP 500 • ENGINE_ERROR
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
            Stellar Data Engine Communication Interrupted
          </h1>
          <p className="text-xs text-zinc-400 font-mono max-w-sm mx-auto leading-relaxed">
            {error?.message || 'The backend proxy encountered an unexpected condition while ingesting Horizon or Soroban RPC data.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => onRetry ? onRetry() : window.location.reload()}
          >
            Retry Telemetry Sync
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
