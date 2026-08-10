import React from 'react';
import { Button } from '../ui/Button';
import { Download, Filter, RefreshCw, Calendar } from 'lucide-react';

export interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  actions?: React.ReactNode;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  onExport,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5 font-mono">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>Last 24 Hours</span>
        </div>

        {onRefresh && (
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRefresh}>
            Refresh
          </Button>
        )}

        {onExport && (
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={onExport}>
            Export CSV
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
};
