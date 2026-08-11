import React from 'react';
import { AlertTriangle, RefreshCw, ZapOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const DemoModeBanner: React.FC = () => {
  const isFallbackMode = useAppStore((s) => s.isFallbackMode);
  const fallbackReason = useAppStore((s) => s.fallbackReason);

  if (!isFallbackMode) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Demo mode status notification"
      className="w-full bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-amber-950/60 border-y border-amber-500/30 px-4 py-2.5 sm:px-6 transition-all duration-300 shadow-md backdrop-blur-md"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Icon & Description */}
        <div className="flex items-center gap-2.5 text-amber-200 font-medium">
          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ZapOff className="w-3.5 h-3.5" aria-hidden="true" />
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
              Demo Mode
            </span>
            <span className="text-zinc-200">
              {fallbackReason || 'Live Express backend services are currently unreachable. Showing simulated blockchain metrics.'}
            </span>
          </div>
        </div>

        {/* Right: Live Connection Monitor Indicator */}
        <div className="flex items-center gap-2 text-zinc-400 text-xs flex-shrink-0 self-end sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5 text-amber-400/80 animate-spin" aria-hidden="true" />
          <span>Auto-reconnecting to live backend...</span>
        </div>
      </div>
    </div>
  );
};
