import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { NavRoute } from '../../types';
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

interface NavItem {
  id: NavRoute;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'info' | 'success' | 'warning';
}

// Static definition outside component to prevent object re-allocation on every render tick
const NAV_ITEMS: NavItem[] = [
  {
    id: 'command-center',
    label: 'Command Center',
    icon: <LayoutDashboard className="w-4 h-4" />,
    badge: 'Live',
    badgeVariant: 'success',
  },
  {
    id: 'dashboard-builder',
    label: 'Dashboard Builder',
    icon: <Grid3X3 className="w-4 h-4" />,
    badge: 'BI',
    badgeVariant: 'info',
  },
  {
    id: 'report-builder',
    label: 'Report Builder',
    icon: <FileText className="w-4 h-4" />,
    badge: 'Export',
    badgeVariant: 'info',
  },
  {
    id: 'alert-center',
    label: 'Alert Center',
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: 'workspace-hub',
    label: 'Workspace Hub',
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    id: 'search-center',
    label: 'Universal Search',
    icon: <Search className="w-4 h-4" />,
  },
  {
    id: 'export-center',
    label: 'Export Center',
    icon: <Download className="w-4 h-4" />,
  },
  {
    id: 'wallet-intelligence',
    label: 'Wallet Intelligence',
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    id: 'soroban-apm',
    label: 'Soroban APM',
    icon: <Cpu className="w-4 h-4" />,
    badge: 'WASM',
    badgeVariant: 'info',
  },
  {
    id: 'assets-corridors',
    label: 'Assets & Corridors',
    icon: <ArrowRightLeft className="w-4 h-4" />,
  },
  {
    id: 'ai-copilot',
    label: 'Gemini AI Insights',
    icon: <Sparkles className="w-4 h-4" />,
    badge: 'AI',
    badgeVariant: 'info',
  },
  {
    id: 'settings-center',
    label: 'Settings & Prefs',
    icon: <Settings className="w-4 h-4" />,
  },
];

export const Sidebar: React.FC = React.memo(() => {
  // Use granular atomic selectors to prevent unnecessary re-renders
  const activeRoute = useAppStore((s) => s.activeRoute);
  const setActiveRoute = useAppStore((s) => s.setActiveRoute);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      aria-label="Application sidebar"
      className={cn(
        'h-screen sticky top-0 z-30 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between transition-all duration-200 select-none shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Sidebar Header Brand Logo */}
      <div>
        <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-950/50"
              >
                N
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-none">NOLYVATIX</span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider">STELLAR BI PLATFORM</span>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div
              aria-hidden="true"
              className="w-8 h-8 rounded bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white mx-auto"
            >
              N
            </div>
          )}

          <button
            onClick={toggleSidebar}
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors hidden md:block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Main navigation" className="p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveRoute(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
                  isActive
                    ? 'bg-zinc-850 text-white font-semibold border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'transition-colors shrink-0',
                    isActive ? 'text-sky-400' : 'text-zinc-400 group-hover:text-zinc-200'
                  )}
                >
                  {item.icon}
                </span>

                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        aria-label={`${item.label} — ${item.badge}`}
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[10px] font-mono uppercase tracking-wider',
                          item.badgeVariant === 'success' && 'bg-emerald-500/20 text-emerald-400',
                          item.badgeVariant === 'info' && 'bg-sky-500/20 text-sky-400',
                          !item.badgeVariant && 'bg-zinc-800 text-zinc-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {isActive && (
                  <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full" />
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
});

Sidebar.displayName = 'Sidebar';
