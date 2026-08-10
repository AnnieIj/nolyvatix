import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // e.g. +12.4 or -3.2
  timeframe?: string; // e.g. "vs 24h ago"
  icon?: React.ReactNode;
  infoTooltip?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  timeframe = 'vs 24h ago',
  icon,
  infoTooltip,
  badgeText,
  badgeVariant = 'neutral',
  className,
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <GlassCard elevation={1} className={cn('relative group hover:border-zinc-700 transition-all', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <span>{title}</span>
            {infoTooltip && (
              <span className="text-zinc-500 hover:text-zinc-300 cursor-help" title={infoTooltip}>
                <Info className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">{value}</div>
          {subtitle && <p className="text-xs text-zinc-500 font-mono">{subtitle}</p>}
        </div>

        {icon && (
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-400 shrink-0 group-hover:border-sky-500/30 group-hover:text-sky-300 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {(change !== undefined || badgeText) && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 font-medium', isPositive ? 'text-emerald-400' : 'text-rose-400')}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{isPositive ? `+${change}%` : `${change}%`}</span>
              <span className="text-zinc-500 font-normal ml-1">{timeframe}</span>
            </div>
          )}

          {badgeText && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-semibold border',
                badgeVariant === 'success' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                badgeVariant === 'warning' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                badgeVariant === 'error' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                badgeVariant === 'info' && 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                badgeVariant === 'neutral' && 'bg-zinc-800 text-zinc-400 border-zinc-700'
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};
