import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'danger' | 'info' | 'neutral' | 'mono';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  children,
  ...props
}) => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700/80',
    mono: 'bg-zinc-900 text-zinc-300 border-zinc-800 font-mono tracking-wider uppercase',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 rounded',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border border-solid shrink-0 select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            variant === 'success' && 'bg-emerald-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'error' && 'bg-rose-400',
            variant === 'info' && 'bg-sky-400',
            variant === 'neutral' && 'bg-zinc-400'
          )}
        />
      )}
      {children}
    </span>
  );
};
