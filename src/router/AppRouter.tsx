/**
 * NovaSQL / Nolyvatix - Production Unified App Router
 * Supports lazy loading, code-splitting, deep-linking, browser history, and 404/error states
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useAppStore } from '../store/useAppStore';
import { NavRoute } from '../types';
import { resolveRoute, getRouteConfig } from './routeRegistry';
import { RouteLoadingSkeleton } from '../components/common/RouteLoadingSkeleton';

// Lazy-loaded production views for optimal bundle splitting
const CommandCenterView = lazy(() =>
  import('../views/CommandCenterView').then((m) => ({ default: m.CommandCenterView }))
);
const DashboardBuilderView = lazy(() =>
  import('../views/DashboardBuilderView').then((m) => ({ default: m.DashboardBuilderView }))
);
const ReportBuilderView = lazy(() =>
  import('../views/ReportBuilderView').then((m) => ({ default: m.ReportBuilderView }))
);
const AlertCenterView = lazy(() =>
  import('../views/AlertCenterView').then((m) => ({ default: m.AlertCenterView }))
);
const WorkspaceHubView = lazy(() =>
  import('../views/WorkspaceHubView').then((m) => ({ default: m.WorkspaceHubView }))
);
const SearchCenterView = lazy(() =>
  import('../views/SearchCenterView').then((m) => ({ default: m.SearchCenterView }))
);
const ExportCenterView = lazy(() =>
  import('../views/ExportCenterView').then((m) => ({ default: m.ExportCenterView }))
);
const WalletIntelligenceView = lazy(() =>
  import('../views/WalletIntelligenceView').then((m) => ({ default: m.WalletIntelligenceView }))
);
const SorobanAPMView = lazy(() =>
  import('../views/SorobanAPMView').then((m) => ({ default: m.SorobanAPMView }))
);
const AssetsCorridorsView = lazy(() =>
  import('../views/AssetsCorridorsView').then((m) => ({ default: m.AssetsCorridorsView }))
);
const AICopilotView = lazy(() =>
  import('../views/AICopilotView').then((m) => ({ default: m.AICopilotView }))
);
const SettingsCenterView = lazy(() =>
  import('../views/SettingsCenterView').then((m) => ({ default: m.SettingsCenterView }))
);

// Error and Fallback Views
const NotFoundView = lazy(() =>
  import('../views/errors/NotFoundView').then((m) => ({ default: m.NotFoundView }))
);
const AccessDeniedView = lazy(() =>
  import('../views/errors/AccessDeniedView').then((m) => ({ default: m.AccessDeniedView }))
);
const ServerErrorView = lazy(() =>
  import('../views/errors/ServerErrorView').then((m) => ({ default: m.ServerErrorView }))
);
const OfflineView = lazy(() =>
  import('../views/errors/OfflineView').then((m) => ({ default: m.OfflineView }))
);

export const AppRouter: React.FC = () => {
  const { activeRoute, setActiveRoute } = useAppStore();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Online / Offline connectivity listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Deep linking and browser history synchronization with URL Hash
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      const targetRoute = resolveRoute(currentHash);
      
      if (targetRoute !== activeRoute) {
        setActiveRoute(targetRoute);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initial check on mount
    if (window.location.hash) {
      handleHashChange();
    } else {
      window.location.hash = `#/command-center`;
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveRoute, activeRoute]);

  // Update hash when activeRoute changes from in-app navigation
  useEffect(() => {
    const expectedHash = `#/${activeRoute}`;
    if (window.location.hash !== expectedHash) {
      window.location.hash = expectedHash;
    }

    // Set document title for accessibility and browser tabs
    const config = getRouteConfig(activeRoute);
    document.title = `${config.label} | NovaSQL Stellar BI`;
  }, [activeRoute]);

  if (!isOnline && activeRoute !== 'offline') {
    return (
      <Suspense fallback={<RouteLoadingSkeleton />}>
        <OfflineView />
      </Suspense>
    );
  }

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'command-center':
        return <CommandCenterView />;
      case 'dashboard-builder':
      case 'custom-dashboards':
        return <DashboardBuilderView />;
      case 'report-builder':
        return <ReportBuilderView />;
      case 'alert-center':
      case 'alerts-settings':
        return <AlertCenterView />;
      case 'workspace-hub':
        return <WorkspaceHubView />;
      case 'search-center':
        return <SearchCenterView />;
      case 'export-center':
        return <ExportCenterView />;
      case 'wallet-intelligence':
        return <WalletIntelligenceView />;
      case 'soroban-apm':
        return <SorobanAPMView />;
      case 'assets-corridors':
        return <AssetsCorridorsView />;
      case 'ai-copilot':
        return <AICopilotView />;
      case 'settings-center':
        return <SettingsCenterView />;
      case 'access-denied':
        return <AccessDeniedView />;
      case 'server-error':
        return <ServerErrorView />;
      case 'offline':
        return <OfflineView />;
      case 'not-found':
      default:
        return <NotFoundView />;
    }
  };

  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      {renderActiveView()}
    </Suspense>
  );
};
