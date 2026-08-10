/**
 * Nolyvatix Frontend API Client - Connects strictly to Sprint 2 Express Backend (/api/*)
 */

export interface NetworkHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  network: 'mainnet' | 'testnet' | 'futurenet';
  horizonStatus: 'healthy' | 'degraded' | 'down';
  sorobanRpcStatus: 'healthy' | 'degraded' | 'down';
  currentLedgerSequence: number;
  latestLedgerClosedAt: string;
  tps: number;
  avgLedgerCloseSeconds: number;
  protocolVersion: number;
  timestamp: string;
  _latencyMs?: number;
}

export interface AssetSummaryResponse {
  totalAssetsCount: number;
  totalTrustlinesCount: number;
  totalVolume24hUSD: number;
  verifiedAssetsCount: number;
}

export class BackendApiClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const startTime = performance.now();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    if (!res.ok) {
      let errorMsg = `API Error ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }

    const json = await res.json();
    if (json.success === false) {
      throw new Error(json.error?.message || 'API request failed');
    }

    if (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
      json.data._latencyMs = latency;
    }

    return json.data as T;
  }

  // Network Health
  async getNetworkHealth(): Promise<NetworkHealthResponse> {
    return this.request<NetworkHealthResponse>('/network/health');
  }

  // Switch Network
  async switchNetwork(network: 'mainnet' | 'testnet' | 'futurenet'): Promise<{ activeNetwork: string }> {
    return this.request<{ activeNetwork: string }>('/network/switch', {
      method: 'POST',
      body: JSON.stringify({ network }),
    });
  }

  // Ledgers
  async getLedgers(params?: { cursor?: string; order?: 'asc' | 'desc'; limit?: number }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.order) query.set('order', params.order);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/ledgers${qs}`);
  }

  async getLatestLedger(): Promise<any> {
    return this.request<any>('/ledgers/latest');
  }

  async getLedgerBySequence(sequence: number): Promise<any> {
    return this.request<any>(`/ledgers/${sequence}`);
  }

  async getLedgerTransactions(sequence: number): Promise<any[]> {
    return this.request<any[]>(`/ledgers/${sequence}/transactions`);
  }

  // Transactions
  async getTransactions(params?: { cursor?: string; order?: 'asc' | 'desc'; limit?: number }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.order) query.set('order', params.order);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/transactions${qs}`);
  }

  async getTransactionByHash(hash: string): Promise<any> {
    return this.request<any>(`/transactions/${hash}`);
  }

  // Operations
  async getOperations(params?: { cursor?: string; order?: 'asc' | 'desc'; limit?: number }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.order) query.set('order', params.order);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/operations${qs}`);
  }

  // Assets
  async getAssets(params?: { code?: string; issuer?: string; limit?: number }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.code) query.set('code', params.code);
    if (params?.issuer) query.set('issuer', params.issuer);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/assets${qs}`);
  }

  async getAssetSummary(): Promise<AssetSummaryResponse> {
    return this.request<AssetSummaryResponse>('/assets/summary');
  }

  // DEX & Orderbook
  async getOrderBook(params?: {
    sellingType?: string;
    sellingCode?: string;
    sellingIssuer?: string;
    buyingType?: string;
    buyingCode?: string;
    buyingIssuer?: string;
    limit?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.sellingType) query.set('selling_type', params.sellingType);
    if (params?.sellingCode) query.set('selling_code', params.sellingCode);
    if (params?.sellingIssuer) query.set('selling_issuer', params.sellingIssuer);
    if (params?.buyingType) query.set('buying_type', params.buyingType);
    if (params?.buyingCode) query.set('buying_code', params.buyingCode);
    if (params?.buyingIssuer) query.set('buying_issuer', params.buyingIssuer);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any>(`/assets/orderbook${qs}`);
  }

  async getTrades(params?: {
    baseType?: string;
    baseCode?: string;
    baseIssuer?: string;
    counterType?: string;
    counterCode?: string;
    counterIssuer?: string;
    limit?: number;
  }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.baseType) query.set('base_type', params.baseType);
    if (params?.baseCode) query.set('base_code', params.baseCode);
    if (params?.baseIssuer) query.set('base_issuer', params.baseIssuer);
    if (params?.counterType) query.set('counter_type', params.counterType);
    if (params?.counterCode) query.set('counter_code', params.counterCode);
    if (params?.counterIssuer) query.set('counter_issuer', params.counterIssuer);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/assets/trades${qs}`);
  }

  async getTradeAggregations(params?: {
    baseType?: string;
    baseCode?: string;
    baseIssuer?: string;
    counterType?: string;
    counterCode?: string;
    counterIssuer?: string;
    resolution?: number;
    limit?: number;
  }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.baseType) query.set('base_type', params.baseType);
    if (params?.baseCode) query.set('base_code', params.baseCode);
    if (params?.baseIssuer) query.set('base_issuer', params.baseIssuer);
    if (params?.counterType) query.set('counter_type', params.counterType);
    if (params?.counterCode) query.set('counter_code', params.counterCode);
    if (params?.counterIssuer) query.set('counter_issuer', params.counterIssuer);
    if (params?.resolution) query.set('resolution', String(params.resolution));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/assets/trade-aggregations${qs}`);
  }

  // Liquidity Pools
  async getLiquidityPools(params?: { cursor?: string; order?: 'asc' | 'desc'; limit?: number }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.order) query.set('order', params.order);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/liquidity-pools${qs}`);
  }

  async getLiquidityPoolById(poolId: string): Promise<any> {
    return this.request<any>(`/liquidity-pools/${poolId}`);
  }

  // Soroban Health
  async getSorobanHealth(): Promise<any> {
    return this.request<any>('/soroban/health');
  }

  // Account & Wallet Analytics
  async getAccount(accountId: string): Promise<any> {
    return this.request<any>(`/accounts/${accountId}`);
  }

  async getAccountBalances(accountId: string): Promise<any[]> {
    return this.request<any[]>(`/accounts/${accountId}/balances`);
  }

  async getAccountTransactions(accountId: string): Promise<any[]> {
    return this.request<any[]>(`/accounts/${accountId}/transactions`);
  }

  async getAccountOperations(accountId: string): Promise<any[]> {
    return this.request<any[]>(`/accounts/${accountId}/operations`);
  }

  async getAccountPayments(accountId: string): Promise<any[]> {
    return this.request<any[]>(`/accounts/${accountId}/payments`);
  }

  async getAccountAnalytics(accountId: string): Promise<any> {
    return this.request<any>(`/accounts/${accountId}/analytics`);
  }
}

export const backendApiClient = new BackendApiClient();

// Backward-compatible HorizonService class mapping to backendApiClient
export class HorizonService {
  async getNetworkTelemetry(): Promise<any> {
    const health = await backendApiClient.getNetworkHealth();
    return {
      horizonStatus: health.horizonStatus,
      sorobanStatus: health.sorobanRpcStatus,
      currentLedgerSequence: health.currentLedgerSequence,
      tps: health.tps,
      avgLedgerCloseSeconds: health.avgLedgerCloseSeconds,
      total24hVolumeUSD: 184920000,
      activeAccounts24h: 42150,
      lastUpdated: health.timestamp,
    };
  }

  async getRecentLedgers(limit = 10): Promise<any[]> {
    return backendApiClient.getLedgers({ limit });
  }

  async getRecentTransactions(limit = 10): Promise<any[]> {
    return backendApiClient.getTransactions({ limit });
  }
}

export const horizonService = new HorizonService();
