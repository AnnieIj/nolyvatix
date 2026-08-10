/**
 * TanStack Query Hooks for Asset & DEX Intelligence
 * Connects directly to Nolyvatix Express Backend APIs (/api/assets/*, /api/liquidity-pools/*)
 */

import { useQuery } from '@tanstack/react-query';
import { backendApiClient } from '../services/api/horizon';

export interface UseAssetOptions {
  code?: string;
  issuer?: string;
  limit?: number;
  refreshInterval?: number;
}

export interface UseOrderBookOptions {
  sellingType?: string;
  sellingCode?: string;
  sellingIssuer?: string;
  buyingType?: string;
  buyingCode?: string;
  buyingIssuer?: string;
  limit?: number;
  refreshInterval?: number;
}

export interface UseTradeOptions {
  baseType?: string;
  baseCode?: string;
  baseIssuer?: string;
  counterType?: string;
  counterCode?: string;
  counterIssuer?: string;
  limit?: number;
  refreshInterval?: number;
}

export interface UseTradeAggregationsOptions {
  baseType?: string;
  baseCode?: string;
  baseIssuer?: string;
  counterType?: string;
  counterCode?: string;
  counterIssuer?: string;
  resolution?: number;
  limit?: number;
  refreshInterval?: number;
}

/**
 * Hook to search/list assets on Stellar
 */
export function useAssets(options: UseAssetOptions = {}) {
  const { code, issuer, limit = 20, refreshInterval = 0 } = options;

  return useQuery({
    queryKey: ['assetsList', code, issuer, limit],
    queryFn: () => backendApiClient.getAssets({ code, issuer, limit }),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 15000,
  });
}

/**
 * Hook to fetch live order book depth and spread for any trading pair
 */
export function useOrderBook(options: UseOrderBookOptions = {}) {
  const {
    sellingType = 'native',
    sellingCode,
    sellingIssuer,
    buyingType = 'credit_alphanum4',
    buyingCode = 'USDC',
    buyingIssuer = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    limit = 20,
    refreshInterval = 5000,
  } = options;

  return useQuery({
    queryKey: ['orderBook', sellingType, sellingCode, sellingIssuer, buyingType, buyingCode, buyingIssuer, limit],
    queryFn: () =>
      backendApiClient.getOrderBook({
        sellingType,
        sellingCode,
        sellingIssuer,
        buyingType,
        buyingCode,
        buyingIssuer,
        limit,
      }),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 4000,
  });
}

/**
 * Hook to fetch recent trades on Stellar DEX for an asset pair
 */
export function useTrades(options: UseTradeOptions = {}) {
  const {
    baseType = 'native',
    baseCode,
    baseIssuer,
    counterType = 'credit_alphanum4',
    counterCode = 'USDC',
    counterIssuer = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    limit = 25,
    refreshInterval = 5000,
  } = options;

  return useQuery({
    queryKey: ['recentTrades', baseType, baseCode, baseIssuer, counterType, counterCode, counterIssuer, limit],
    queryFn: () =>
      backendApiClient.getTrades({
        baseType,
        baseCode,
        baseIssuer,
        counterType,
        counterCode,
        counterIssuer,
        limit,
      }),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 4000,
  });
}

/**
 * Hook to fetch OHLCV price candle history (trade aggregations)
 */
export function useTradeAggregations(options: UseTradeAggregationsOptions = {}) {
  const {
    baseType = 'native',
    baseCode,
    baseIssuer,
    counterType = 'credit_alphanum4',
    counterCode = 'USDC',
    counterIssuer = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    resolution = 86400000, // 1 day
    limit = 14,
    refreshInterval = 30000,
  } = options;

  return useQuery({
    queryKey: [
      'tradeAggregations',
      baseType,
      baseCode,
      baseIssuer,
      counterType,
      counterCode,
      counterIssuer,
      resolution,
      limit,
    ],
    queryFn: () =>
      backendApiClient.getTradeAggregations({
        baseType,
        baseCode,
        baseIssuer,
        counterType,
        counterCode,
        counterIssuer,
        resolution,
        limit,
      }),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 15000,
  });
}

/**
 * Hook to fetch AMM Liquidity Pools list
 */
export function useLiquidityPools(limit = 25) {
  return useQuery({
    queryKey: ['liquidityPoolsList', limit],
    queryFn: () => backendApiClient.getLiquidityPools({ limit }),
    staleTime: 15000,
  });
}

/**
 * Hook to fetch single AMM Liquidity Pool details
 */
export function useLiquidityPoolDetail(poolId: string | null) {
  return useQuery({
    queryKey: ['liquidityPoolDetail', poolId],
    queryFn: () => (poolId ? backendApiClient.getLiquidityPoolById(poolId) : null),
    enabled: !!poolId,
    staleTime: 30000,
  });
}
