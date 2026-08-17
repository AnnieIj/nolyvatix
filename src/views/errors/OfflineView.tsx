import React from 'react';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineView: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <GlassCard className="max-w-lg w-full text-center p-8 space-y-6 border-zinc-800 bg-zinc-950/90 shadow-2xl">
        <div className="w-16 h-16 mx-auto bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-2xl flex items-center justify-center">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">
            OFFLINE_DETECTED
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
            No Network Connection
          </h1>
          <p className="text-xs text-zinc-400 font-mono max-w-sm mx-auto leading-relaxed">
            Your client lost connectivity to the Stellar Horizon and Soroban RPC nodes. Reconnect to resume real-time ledger streaming.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Reconnect Now
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default OfflineView;
