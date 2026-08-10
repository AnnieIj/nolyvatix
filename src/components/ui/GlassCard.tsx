import React from 'react';
import { cn } from '../../lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  headerBorder?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  className,
  elevation = 1,
  title,
  subtitle,
  action,
  footer,
  headerBorder = true,
  children,
  ...props
}) => {
  const elevationStyles = {
    0: 'bg-zinc-900/40 border border-zinc-800/60',
    1: 'glass-card border border-zinc-800/80 shadow-md',
    2: 'bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/80 shadow-lg shadow-black/40',
    3: 'bg-zinc-900/90 backdrop-blur-2xl border border-sky-500/20 shadow-xl shadow-sky-950/20',
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200 overflow-hidden text-zinc-100',
        elevationStyles[elevation],
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div
          className={cn(
            'px-4 py-3 flex items-center justify-between gap-3',
            headerBorder && 'border-b border-zinc-800/80'
          )}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className="p-4">{children}</div>

      {footer && (
        <div className="px-4 py-2.5 bg-zinc-950/40 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
