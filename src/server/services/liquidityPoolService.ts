/**
 * Nolyvatix Data Engine - Liquidity Pool Service
 */

import { LiquidityPoolRepository } from '../repositories/liquidityPoolRepository.ts';
import { StellarLiquidityPool, PaginationParams } from '../types/stellar.ts';

export class LiquidityPoolService {
  private poolRepo: LiquidityPoolRepository;

  constructor(poolRepo: LiquidityPoolRepository) {
    this.poolRepo = poolRepo;
  }

  public async getLiquidityPools(params?: PaginationParams): Promise<StellarLiquidityPool[]> {
    return this.poolRepo.getLiquidityPools(params);
  }

  public async getLiquidityPoolById(poolId: string): Promise<StellarLiquidityPool> {
    return this.poolRepo.getLiquidityPoolById(poolId);
  }
}
