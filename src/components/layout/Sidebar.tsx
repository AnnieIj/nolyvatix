import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getVisibleNavRoutes } from '../../router/routeRegistry';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Grid3X3,
  FileText,
  Bell,
  Briefcase,
  Search,
  Download,
  Settings,
  Wallet,
  Cpu,
  ArrowRightLeft,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRoute, setActiveRoute, sidebarCollapsed, toggleSidebar } = useAppStore();
  const visibleRoutes = getVisibleNavRoutes();

  const getRouteIcon = (iconName: string, isActive: boolean) => {
    const className = cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-sky-400' : 'text-zinc-400 group-hover:text-zinc-200');
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className={className} />;
      case 'Grid3X3':
        return <Grid3X3 className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'Bell':
        return <Bell className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Search':
        return <Search className={className} />;
      case 'Download':
        return <Download className={className} />;
      case 'Wallet':
        return <Wallet className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'ArrowRightLeft':
        return <ArrowRightLeft className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Settings':
        return <Settings className={className} />;
      default:
        return <LayoutDashboard className={className} />;
    }
  };

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 z-30 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between transition-all duration-200 select-none shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
      aria-label="Main Navigation"
    >
      {/* Sidebar Header Brand Logo */}
      <div>
        <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <button
              onClick={() => setActiveRoute('command-center')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-7 h-7 rounded bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-950/50">
                N
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-none group-hover:text-sky-400 transition-colors">
                  NOLYVATIX
                </span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider">STELLAR BI PLATFORM</span>
              </div>
            </button>
          )}

          {sidebarCollapsed && (
            <button
              onClick={() => setActiveRoute('command-center')}
              className="w-8 h-8 rounded bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white mx-auto"
            >
              N
            </button>
          )}

          <button
            onClick={toggleSidebar}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors hidden md:block"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1" aria-label="Sidebar Menu">
          {visibleRoutes.map((route) => {
            const isActive = activeRoute === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setActiveRoute(route.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group relative',
                  isActive
                    ? 'bg-zinc-850 text-white font-semibold border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                )}
                title={sidebarCollapsed ? route.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {getRouteIcon(route.icon, isActive)}

                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{route.label}</span>
                    {route.badge && (
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[10px] font-mono uppercase tracking-wider',
                          route.badgeVariant === 'success' && 'bg-emerald-500/20 text-emerald-400',
                          route.badgeVariant === 'info' && 'bg-sky-500/20 text-sky-400',
                          !route.badgeVariant && 'bg-zinc-800 text-zinc-400'
                        )}
                      >
                        {route.badge}
                      </span>
                    )}
                  </div>
                )}

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer System Info */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80">
        {!sidebarCollapsed ? (
          <div className="p-2.5 bg-zinc-900 border border-zinc-800/80 rounded-lg space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security</span>
              </span>
              <span className="text-emerald-400 font-semibold">ED25519</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500 text-[10px]">
              <span>Platform</span>
              <span>v1.0.0 Architecture</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
