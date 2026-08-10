import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChartContainerProps {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  height?: number;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactElement;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  action,
  height = 280,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No chart data available',
  children,
  className,
}) => {
  return (
    <GlassCard
      title={title}
      subtitle={subtitle}
      action={action}
      className={cn('w-full', className)}
    >
      <div style={{ height }} className="relative w-full">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 rounded">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          </div>
        ) : isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 font-mono">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
};
