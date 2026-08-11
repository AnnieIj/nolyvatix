import { create } from 'zustand';
import { ThemeMode, StellarNetwork, NavRoute, WalletState, NetworkTelemetry } from '../types';

interface AppStore {
  // Theme & Layout
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  aiCopilotOpen: boolean;
  activeRoute: NavRoute;

  // Blockchain Environment & Service Health
  stellarNetwork: StellarNetwork;
  networkTelemetry: NetworkTelemetry;

  // Fallback / Mock Data Mode
  isFallbackMode: boolean;
  fallbackReason: string | null;

  // Web3 Wallet State
  wallet: WalletState;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setAICopilotOpen: (open: boolean) => void;
  toggleAICopilot: () => void;
  setActiveRoute: (route: NavRoute) => void;
  setStellarNetwork: (network: StellarNetwork) => void;
  setNetworkTelemetry: (telemetry: NetworkTelemetry) => void;
  setFallbackMode: (isFallback: boolean, reason?: string) => void;
  connectMockWallet: (walletName?: string) => void;
  disconnectWallet: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Default dark theme matching Nolyvatix / LumenIQ design specification
  theme: 'dark',
  sidebarCollapsed: false,
  aiCopilotOpen: false,
  activeRoute: 'command-center',

  stellarNetwork: 'mainnet',
  networkTelemetry: {
    horizonStatus: 'healthy',
    sorobanStatus: 'healthy',
    currentLedgerSequence: 52918402,
    tps: 52.4,
    avgLedgerCloseSeconds: 4.8,
    total24hVolumeUSD: 184920000,
    activeAccounts24h: 42150,
    lastUpdated: new Date().toISOString(),
  },

  isFallbackMode: false,
  fallbackReason: null,

  wallet: {
    isConnected: false,
    publicKey: null,
    name: null,
    balanceXLM: 0,
  },

  setTheme: (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    });
  },

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setAICopilotOpen: (open) => set({ aiCopilotOpen: open }),
  toggleAICopilot: () => set((state) => ({ aiCopilotOpen: !state.aiCopilotOpen })),

  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setStellarNetwork: (stellarNetwork) => set({ stellarNetwork }),
  setNetworkTelemetry: (networkTelemetry) => set({ networkTelemetry }),

  setFallbackMode: (isFallback, reason) =>
    set((state) => {
      // Only trigger state update if value changed to avoid re-render loops
      if (state.isFallbackMode === isFallback && state.fallbackReason === (reason || null)) {
        return state;
      }
      return {
        isFallbackMode: isFallback,
        fallbackReason: isFallback ? reason || 'Live backend services are unavailable. Displaying cached fallback data.' : null,
      };
    }),

  connectMockWallet: (walletName = 'Freighter') => {
    set({
      wallet: {
        isConnected: true,
        publicKey: 'GAAXK902837465102938475610293847561029384756',
        name: walletName,
        balanceXLM: 14580.45,
      },
    });
  },

  disconnectWallet: () => {
    set({
      wallet: {
        isConnected: false,
        publicKey: null,
        name: null,
        balanceXLM: 0,
      },
    });
  },
}));
