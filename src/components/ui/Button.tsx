import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded';

    const variants = {
      primary:
        'bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 shadow-sm font-semibold dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
      ghost:
        'bg-transparent text-zinc-300 hover:bg-zinc-800/60 hover:text-white active:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white',
      glass:
        'bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800/80 hover:text-white border border-white/10 backdrop-blur-md dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/80',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded',
      md: 'text-sm px-3.5 py-2 gap-2 rounded-md',
      lg: 'text-base px-5 py-2.5 gap-2.5 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
