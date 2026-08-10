import React from 'react';
import { cn } from '../../lib/utils';
import { HealthStatus } from '../../types';

export interface StatusChipProps {
  status: HealthStatus;
  label?: string;
  showPulse?: boolean;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  showPulse = true,
  className,
}) => {
  const config = {
    healthy: {
      color: 'bg-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      defaultLabel: 'OPERATIONAL',
    },
    degraded: {
      color: 'bg-amber-500',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      defaultLabel: 'DEGRADED',
    },
    offline: {
      color: 'bg-rose-500',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      defaultLabel: 'OFFLINE',
    },
  };

  const curr = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium border uppercase tracking-wider select-none',
        curr.bg,
        curr.text,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && status === 'healthy' && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', curr.color)} />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', curr.color)} />
      </span>
      <span>{label || curr.defaultLabel}</span>
    </span>
  );
};
