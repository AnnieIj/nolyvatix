/**
 * Nolyvatix Data Engine - Liquidity Pool Repository
 */

import { HorizonClient } from '../clients/horizonClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { StellarLiquidityPool, PaginationParams } from '../types/stellar.js';
import { NotFoundError } from '../utils/errors.js';

export interface HorizonLiquidityPoolRaw {
  id: string;
  paging_token: string;
  fee_bp: number;
  type: 'constant_product';
  total_shares: string;
  total_trustlines: number;
  reserves: Array<{
    asset: string;
    amount: string;
  }>;
}

export interface HorizonEmbeddedLiquidityPools {
  _embedded: {
    records: HorizonLiquidityPoolRaw[];
  };
}

export class LiquidityPoolRepository {
  private horizonClient: HorizonClient;
  private cache: MemoryCache;

  constructor(horizonClient: HorizonClient, cache: MemoryCache) {
    this.horizonClient = horizonClient;
    this.cache = cache;
  }

  public mapRawPool(raw: HorizonLiquidityPoolRaw): StellarLiquidityPool {
    return {
      id: raw.id,
      pagingToken: raw.paging_token,
      feeBP: raw.fee_bp,
      type: raw.type,
      totalShares: raw.total_shares,
      totalTrustlines: raw.total_trustlines,
      reserves: raw.reserves || [],
    };
  }

  public async getLiquidityPools(params?: PaginationParams): Promise<StellarLiquidityPool[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `pools_recent_${queryParams.cursor}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedLiquidityPools>('/liquidity_pools', queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawPool(r));
    }, 30);
  }

  public async getLiquidityPoolById(poolId: string): Promise<StellarLiquidityPool> {
    const cacheKey = `pool_id_${poolId}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<HorizonLiquidityPoolRaw>(`/liquidity_pools/${poolId}`);
        return this.mapRawPool(raw);
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw new NotFoundError('Liquidity Pool', poolId);
        }
        throw err;
      }
    }, 60);
  }
}
