import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getRouteConfig } from '../../router/routeRegistry';
import { Button } from '../ui/Button';
import { Download, RefreshCw, Calendar, ChevronRight } from 'lucide-react';

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
  const { activeRoute, setActiveRoute } = useAppStore();
  const routeConfig = getRouteConfig(activeRoute);
  const breadcrumbs = routeConfig.breadcrumbs || [];

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-zinc-800">
      {/* Synchronized Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-600" />}
              {crumb.route && !isLast ? (
                <button
                  onClick={() => setActiveRoute(crumb.route!)}
                  className="hover:text-sky-400 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={isLast ? 'text-zinc-200 font-semibold' : 'text-zinc-400'}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Main Title and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
    </div>
  );
};
