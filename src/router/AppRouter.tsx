import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CommandCenterView } from '../views/CommandCenterView';
import { WalletIntelligenceView } from '../views/WalletIntelligenceView';
import { SorobanAPMView } from '../views/SorobanAPMView';
import { AssetsCorridorsView } from '../views/AssetsCorridorsView';
import { AICopilotView } from '../views/AICopilotView';
import { DashboardBuilderView } from '../views/DashboardBuilderView';
import { ReportBuilderView } from '../views/ReportBuilderView';
import { AlertCenterView } from '../views/AlertCenterView';
import { WorkspaceHubView } from '../views/WorkspaceHubView';
import { SearchCenterView } from '../views/SearchCenterView';
import { ExportCenterView } from '../views/ExportCenterView';
import { AlertsSettingsView } from '../views/AlertsSettingsView';
import { NavRoute } from '../types';

/** All valid client-side route identifiers. Must be kept in sync with NavRoute type. */
const VALID_ROUTES: NavRoute[] = [
  'command-center',
  'dashboard-builder',
  'report-builder',
  'alert-center',
  'workspace-hub',
  'search-center',
  'export-center',
  'settings-center',
  'wallet-intelligence',
  'soroban-apm',
  'assets-corridors',
  'ai-copilot',
  'custom-dashboards',
  'alerts-settings',
];

export const AppRouter: React.FC = () => {
  const { activeRoute, setActiveRoute } = useAppStore();

  // Sync route with URL hash for clean deep linking support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') as NavRoute;
      if (VALID_ROUTES.includes(hash)) {
        setActiveRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveRoute]);

  useEffect(() => {
    window.location.hash = `#/${activeRoute}`;
  }, [activeRoute]);

  switch (activeRoute) {
    case 'command-center':
      return <CommandCenterView />;
    case 'dashboard-builder':
    case 'custom-dashboards': // legacy alias
      return <DashboardBuilderView />;
    case 'report-builder':
      return <ReportBuilderView />;
    case 'alert-center':
      return <AlertCenterView />;
    case 'workspace-hub':
      return <WorkspaceHubView />;
    case 'search-center':
      return <SearchCenterView />;
    case 'export-center':
      return <ExportCenterView />;
    case 'settings-center':
    case 'alerts-settings': // legacy alias
      return <AlertsSettingsView />;
    case 'wallet-intelligence':
      return <WalletIntelligenceView />;
    case 'soroban-apm':
      return <SorobanAPMView />;
    case 'assets-corridors':
      return <AssetsCorridorsView />;
    case 'ai-copilot':
      return <AICopilotView />;
    default:
      return <CommandCenterView />;
  }
};
