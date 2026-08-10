/**
 * Nolyvatix Data Engine - Asset Repository
 */

import { HorizonClient } from '../clients/horizonClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { StellarAsset, StellarOrderBook, StellarTrade, TradeAggregation, OrderBookItem, PaginationParams } from '../types/stellar.js';

export interface HorizonAssetRaw {
  asset_type: 'credit_alphanum4' | 'credit_alphanum12';
  asset_code: string;
  asset_issuer: string;
  paging_token: string;
  num_accounts: number;
  num_claimable_balances: number;
  num_liquidity_pools: number;
  amount: string;
  accounts: {
    authorized: number;
    authorized_to_maintain_liabilities: number;
    unauthorized: number;
  };
  claimable_balances_amount: string;
  liquidity_pools_amount: string;
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
}

export interface HorizonEmbeddedAssets {
  _embedded: {
    records: HorizonAssetRaw[];
  };
}

export interface HorizonOrderBookRaw {
  bids: Array<{ price: string; amount: string; price_r?: { n: number; d: number } }>;
  asks: Array<{ price: string; amount: string; price_r?: { n: number; d: number } }>;
  base: { asset_type: string; asset_code?: string; asset_issuer?: string };
  counter: { asset_type: string; asset_code?: string; asset_issuer?: string };
}

export interface HorizonTradeRaw {
  id: string;
  paging_token: string;
  ledger_close_time: string;
  trade_type: string;
  base_account: string;
  base_amount: string;
  base_asset_type: string;
  base_asset_code?: string;
  base_asset_issuer?: string;
  counter_account: string;
  counter_amount: string;
  counter_asset_type: string;
  counter_asset_code?: string;
  counter_asset_issuer?: string;
  price: { n: string; d: string } | string;
}

export interface HorizonEmbeddedTrades {
  _embedded: {
    records: HorizonTradeRaw[];
  };
}

export interface HorizonTradeAggregationRaw {
  timestamp: string;
  trade_count: string;
  base_volume: string;
  counter_volume: string;
  avg: string;
  high: string;
  low: string;
  open: string;
  close: string;
}

export interface HorizonEmbeddedTradeAggregations {
  _embedded: {
    records: HorizonTradeAggregationRaw[];
  };
}

export class AssetRepository {
  private horizonClient: HorizonClient;
  private cache: MemoryCache;

  constructor(horizonClient: HorizonClient, cache: MemoryCache) {
    this.horizonClient = horizonClient;
    this.cache = cache;
  }

  public mapRawAsset(raw: HorizonAssetRaw): StellarAsset {
    return {
      assetType: raw.asset_type,
      assetCode: raw.asset_code,
      assetIssuer: raw.asset_issuer,
      pagingToken: raw.paging_token,
      numAccounts: raw.num_accounts,
      numClaimableBalances: raw.num_claimable_balances,
      numLiquidityPools: raw.num_liquidity_pools,
      amount: raw.amount,
      accounts: {
        authorized: raw.accounts?.authorized || 0,
        authorizedToMaintainLiabilities: raw.accounts?.authorized_to_maintain_liabilities || 0,
        unauthorized: raw.accounts?.unauthorized || 0,
      },
      claimableBalancesAmount: raw.claimable_balances_amount || '0',
      liquidityPoolsAmount: raw.liquidity_pools_amount || '0',
      flags: {
        authRequired: raw.flags?.auth_required || false,
        authRevocable: raw.flags?.auth_revocable || false,
        authImmutable: raw.flags?.auth_immutable || false,
        authClawbackEnabled: raw.flags?.auth_clawback_enabled || false,
      },
    };
  }

  public async getAssets(
    code?: string,
    issuer?: string,
    params?: PaginationParams
  ): Promise<StellarAsset[]> {
    const pagination = this.horizonClient.buildPaginationParams(params);
    const queryParams: Record<string, unknown> = {
      ...pagination,
      asset_code: code,
      asset_issuer: issuer,
    };

    const cacheKey = `assets_${code}_${issuer}_${pagination.cursor}_${pagination.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedAssets>('/assets', queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawAsset(r));
    }, 30);
  }

  public async getOrderBook(
    selling: { type: string; code?: string; issuer?: string },
    buying: { type: string; code?: string; issuer?: string },
    limit = 20
  ): Promise<StellarOrderBook> {
    const queryParams: Record<string, unknown> = {
      selling_asset_type: selling.type,
      buying_asset_type: buying.type,
      limit,
    };
    if (selling.type !== 'native' && selling.code) queryParams.selling_asset_code = selling.code;
    if (selling.type !== 'native' && selling.issuer) queryParams.selling_asset_issuer = selling.issuer;
    if (buying.type !== 'native' && buying.code) queryParams.buying_asset_code = buying.code;
    if (buying.type !== 'native' && buying.issuer) queryParams.buying_asset_issuer = buying.issuer;

    const cacheKey = `orderbook_${selling.type}_${selling.code}_${buying.type}_${buying.code}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonOrderBookRaw>('/order_book', queryParams);

      let cumBidDepth = 0;
      const bids: OrderBookItem[] = (raw.bids || []).map((b) => {
        cumBidDepth += parseFloat(b.amount);
        return {
          price: b.price,
          amount: b.amount,
          priceR: b.price_r,
          depthCumulative: cumBidDepth,
        };
      });

      let cumAskDepth = 0;
      const asks: OrderBookItem[] = (raw.asks || []).map((a) => {
        cumAskDepth += parseFloat(a.amount);
        return {
          price: a.price,
          amount: a.amount,
          priceR: a.price_r,
          depthCumulative: cumAskDepth,
        };
      });

      const topBid = bids.length > 0 ? parseFloat(bids[0].price) : 0;
      const topAsk = asks.length > 0 ? parseFloat(asks[0].price) : 0;
      const spread = topAsk > 0 && topBid > 0 ? Math.max(0, topAsk - topBid) : 0;
      const spreadPercentage = topAsk > 0 ? (spread / topAsk) * 100 : 0;

      const baseAsset = selling.type === 'native' ? 'XLM' : selling.code || 'UNKNOWN';
      const counterAsset = buying.type === 'native' ? 'XLM' : buying.code || 'UNKNOWN';

      return {
        bids,
        asks,
        baseAsset,
        counterAsset,
        spread: parseFloat(spread.toFixed(7)),
        spreadPercentage: parseFloat(spreadPercentage.toFixed(4)),
      };
    }, 10);
  }

  public async getTrades(params: {
    baseType?: string;
    baseCode?: string;
    baseIssuer?: string;
    counterType?: string;
    counterCode?: string;
    counterIssuer?: string;
    limit?: number;
  }): Promise<StellarTrade[]> {
    const limit = params.limit || 20;
    const queryParams: Record<string, unknown> = {
      base_asset_type: params.baseType || 'native',
      counter_asset_type: params.counterType || 'credit_alphanum4',
      order: 'desc',
      limit,
    };
    if (params.baseCode) queryParams.base_asset_code = params.baseCode;
    if (params.baseIssuer) queryParams.base_asset_issuer = params.baseIssuer;
    if (params.counterCode) queryParams.counter_asset_code = params.counterCode;
    if (params.counterIssuer) queryParams.counter_asset_issuer = params.counterIssuer;

    const cacheKey = `trades_${params.baseCode}_${params.counterCode}_${limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedTrades>('/trades', queryParams);
      return (raw._embedded?.records || []).map((t) => {
        let priceNum = 0;
        if (typeof t.price === 'object' && t.price?.n && t.price?.d) {
          priceNum = parseFloat(t.price.n) / parseFloat(t.price.d);
        } else if (typeof t.price === 'string') {
          priceNum = parseFloat(t.price);
        }

        return {
          id: t.id,
          pagingToken: t.paging_token,
          ledgerCloseTime: t.ledger_close_time,
          tradeType: t.trade_type,
          baseAccount: t.base_account,
          baseAmount: t.base_amount,
          baseAssetType: t.base_asset_type,
          baseAssetCode: t.base_asset_type === 'native' ? 'XLM' : t.base_asset_code || 'UNKNOWN',
          baseAssetIssuer: t.base_asset_issuer,
          counterAccount: t.counter_account,
          counterAmount: t.counter_amount,
          counterAssetType: t.counter_asset_type,
          counterAssetCode: t.counter_asset_type === 'native' ? 'XLM' : t.counter_asset_code || 'UNKNOWN',
          counterAssetIssuer: t.counter_asset_issuer,
          price: parseFloat(priceNum.toFixed(7)),
        };
      });
    }, 15);
  }

  public async getTradeAggregations(params: {
    baseType?: string;
    baseCode?: string;
    baseIssuer?: string;
    counterType?: string;
    counterCode?: string;
    counterIssuer?: string;
    resolution?: number; // ms, default 86400000 (1 day)
    limit?: number;
  }): Promise<TradeAggregation[]> {
    const resolution = params.resolution || 86400000;
    const limit = params.limit || 14;

    const queryParams: Record<string, unknown> = {
      base_asset_type: params.baseType || 'native',
      counter_asset_type: params.counterType || 'credit_alphanum4',
      resolution,
      limit,
      order: 'desc',
    };
    if (params.baseCode) queryParams.base_asset_code = params.baseCode;
    if (params.baseIssuer) queryParams.base_asset_issuer = params.baseIssuer;
    if (params.counterCode) queryParams.counter_asset_code = params.counterCode;
    if (params.counterIssuer) queryParams.counter_asset_issuer = params.counterIssuer;

    const cacheKey = `trade_aggs_${params.baseCode}_${params.counterCode}_${resolution}_${limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedTradeAggregations>('/trade_aggregations', queryParams);
      return (raw._embedded?.records || []).map((ag) => {
        const ts = parseInt(ag.timestamp, 10);
        return {
          timestamp: ts,
          dateStr: new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          open: parseFloat(ag.open),
          high: parseFloat(ag.high),
          low: parseFloat(ag.low),
          close: parseFloat(ag.close),
          baseVolume: parseFloat(ag.base_volume),
          counterVolume: parseFloat(ag.counter_volume),
          tradeCount: parseInt(ag.trade_count, 10),
        };
      }).reverse(); // return in chronological order
    }, 60);
  }
}

