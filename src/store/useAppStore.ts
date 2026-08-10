import { create } from 'zustand';
import { ThemeMode, StellarNetwork, NavRoute, WalletState, NetworkTelemetry } from '../types';
import { connectWalletProvider, WalletProvider } from '../services/wallet/walletService';

interface AppStore {
  // Theme & Layout
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  aiCopilotOpen: boolean;
  activeRoute: NavRoute;

  // Blockchain Environment
  stellarNetwork: StellarNetwork;
  networkTelemetry: NetworkTelemetry;

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
  connectWallet: (provider: WalletProvider) => Promise<void>;
  disconnectWallet: () => void;
  clearWalletError: () => void;
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

  wallet: {
    isConnected: false,
    publicKey: null,
    name: null,
    network: null,
    balanceXLM: 0,
    connecting: false,
    error: null,
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

  connectWallet: async (provider) => {
    set((state) => ({ wallet: { ...state.wallet, connecting: true, error: null } }));
    try {
      const connected = await connectWalletProvider(provider);
      set({
        wallet: {
          isConnected: true,
          publicKey: connected.publicKey,
          name: connected.name,
          network: connected.network,
          balanceXLM: connected.balanceXLM,
          connecting: false,
          error: null,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet.';
      set((state) => ({
        wallet: { ...state.wallet, isConnected: false, connecting: false, error: message },
      }));
    }
  },

  disconnectWallet: () => {
    set({
      wallet: {
        isConnected: false,
        publicKey: null,
        name: null,
        network: null,
        balanceXLM: 0,
        connecting: false,
        error: null,
      },
    });
  },

  clearWalletError: () => {
    set((state) => ({ wallet: { ...state.wallet, error: null } }));
  },
}));
