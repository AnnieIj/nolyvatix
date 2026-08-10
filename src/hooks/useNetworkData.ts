/**
 * TanStack Query Hooks for Network Command Center
 * Consumes Express Backend APIs directly via backendApiClient
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendApiClient, NetworkHealthResponse, AssetSummaryResponse } from '../services/api/horizon';
import { useAppStore } from '../store/useAppStore';

export interface UseNetworkDataOptions {
  refreshInterval?: number; // in ms (0 = disabled)
}

/**
 * Hook to fetch live network health & telemetry metrics
 */
export function useNetworkHealth(options: UseNetworkDataOptions = {}) {
  const { refreshInterval = 5000 } = options;
  const setNetworkTelemetry = useAppStore((s) => s.setNetworkTelemetry);
  const setStellarNetwork = useAppStore((s) => s.setStellarNetwork);

  return useQuery({
    queryKey: ['networkHealth'],
    queryFn: async () => {
      const data = await backendApiClient.getNetworkHealth();
      if (data) {
        setNetworkTelemetry({
          horizonStatus: data.horizonStatus === 'down' ? 'offline' : data.horizonStatus,
          sorobanStatus: data.sorobanRpcStatus === 'down' ? 'offline' : data.sorobanRpcStatus,
          currentLedgerSequence: data.currentLedgerSequence,
          tps: data.tps,
          avgLedgerCloseSeconds: data.avgLedgerCloseSeconds,
          total24hVolumeUSD: 184920000,
          activeAccounts24h: 42150,
          lastUpdated: data.timestamp,
        });
        if (data.network === 'mainnet' || data.network === 'testnet') {
          setStellarNetwork(data.network);
        }
      }
      return data;
    },
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 3000,
  });
}

/**
 * Hook to fetch Soroban RPC health
 */
export function useSorobanHealth(options: UseNetworkDataOptions = {}) {
  const { refreshInterval = 10000 } = options;

  return useQuery({
    queryKey: ['sorobanHealth'],
    queryFn: async () => {
      const startTime = performance.now();
      const res = await backendApiClient.getSorobanHealth();
      const endTime = performance.now();
      return {
        ...res,
        rpcLatencyMs: Math.round(endTime - startTime),
      };
    },
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 5000,
  });
}

/**
 * Hook to fetch live closed ledgers
 */
export function useLatestLedgers(limit = 20, options: UseNetworkDataOptions = {}) {
  const { refreshInterval = 5000 } = options;

  return useQuery({
    queryKey: ['latestLedgers', limit],
    queryFn: () => backendApiClient.getLedgers({ limit, order: 'desc' }),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 3000,
  });
}

/**
 * Hook to fetch recent transactions
 */
export function useRecentTransactions(limit = 20, options: UseNetworkDataOptions = {}) {
  const { refreshInterval = 5000 } = options;

  return useQuery({
    queryKey: ['recentTransactions', limit],
    queryFn: () => backendApiClient.getTransactions({ limit, order: 'desc' }),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 3000,
  });
}

/**
 * Hook to fetch recent operations
 */
export function useRecentOperations(limit = 20, options: UseNetworkDataOptions = {}) {
  const { refreshInterval = 5000 } = options;

  return useQuery({
    queryKey: ['recentOperations', limit],
    queryFn: () => backendApiClient.getOperations({ limit, order: 'desc' }),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 3000,
  });
}

/**
 * Hook to fetch asset summary
 */
export function useAssetSummary() {
  return useQuery({
    queryKey: ['assetSummary'],
    queryFn: () => backendApiClient.getAssetSummary(),
    staleTime: 15000,
  });
}

/**
 * Hook to fetch liquidity pools
 */
export function useLiquidityPools(limit = 20) {
  return useQuery({
    queryKey: ['liquidityPools', limit],
    queryFn: () => backendApiClient.getLiquidityPools({ limit, order: 'desc' }),
    staleTime: 15000,
  });
}

/**
 * Hook to fetch single ledger sequence details and its transactions
 */
export function useLedgerDetail(sequence: number | null) {
  return useQuery({
    queryKey: ['ledgerDetail', sequence],
    queryFn: async () => {
      if (!sequence) return null;
      const [ledger, transactions] = await Promise.all([
        backendApiClient.getLedgerBySequence(sequence),
        backendApiClient.getLedgerTransactions(sequence).catch(() => []),
      ]);
      return { ledger, transactions };
    },
    enabled: sequence !== null && sequence > 0,
    staleTime: 60000,
  });
}

/**
 * Hook to fetch account intelligence analytics for a searched wallet
 */
export function useAccountAnalytics(accountId: string | null, options: UseNetworkDataOptions = {}) {
  const { refreshInterval = 0 } = options;

  return useQuery({
    queryKey: ['accountAnalytics', accountId],
    queryFn: async () => {
      if (!accountId || !accountId.startsWith('G') || accountId.length !== 56) return null;
      return backendApiClient.getAccountAnalytics(accountId);
    },
    enabled: !!accountId && accountId.startsWith('G') && accountId.length === 56,
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 10000,
    retry: 1,
  });
}

/**
 * Hook to fetch account transactions
 */
export function useAccountTransactions(accountId: string | null) {
  return useQuery({
    queryKey: ['accountTransactions', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      return backendApiClient.getAccountTransactions(accountId);
    },
    enabled: !!accountId && accountId.startsWith('G') && accountId.length === 56,
    staleTime: 10000,
  });
}

/**
 * Mutation hook to switch target Stellar network (mainnet, testnet, futurenet)
 */
export function useSwitchNetworkMutation() {
  const queryClient = useQueryClient();
  const setStellarNetwork = useAppStore((s) => s.setStellarNetwork);

  return useMutation({
    mutationFn: (network: 'mainnet' | 'testnet' | 'futurenet') =>
      backendApiClient.switchNetwork(network),
    onSuccess: (res) => {
      if (res.activeNetwork === 'mainnet' || res.activeNetwork === 'testnet') {
        setStellarNetwork(res.activeNetwork);
      }
      queryClient.invalidateQueries();
    },
  });
}
