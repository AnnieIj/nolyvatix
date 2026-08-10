/**
 * Nolyvatix Data Engine - Asset Service
 */

import { AssetRepository } from '../repositories/assetRepository.ts';
import { StellarAsset, StellarOrderBook, StellarTrade, TradeAggregation, PaginationParams } from '../types/stellar.ts';

export class AssetService {
  private assetRepo: AssetRepository;

  constructor(assetRepo: AssetRepository) {
    this.assetRepo = assetRepo;
  }

  public async getAssets(code?: string, issuer?: string, params?: PaginationParams): Promise<StellarAsset[]> {
    return this.assetRepo.getAssets(code, issuer, params);
  }

  public async getOrderBook(
    selling: { type: string; code?: string; issuer?: string },
    buying: { type: string; code?: string; issuer?: string },
    limit = 20
  ): Promise<StellarOrderBook> {
    return this.assetRepo.getOrderBook(selling, buying, limit);
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
    return this.assetRepo.getTrades(params);
  }

  public async getTradeAggregations(params: {
    baseType?: string;
    baseCode?: string;
    baseIssuer?: string;
    counterType?: string;
    counterCode?: string;
    counterIssuer?: string;
    resolution?: number;
    limit?: number;
  }): Promise<TradeAggregation[]> {
    return this.assetRepo.getTradeAggregations(params);
  }

  public async getAssetSummary(): Promise<{
    totalAssetsTracked: number;
    topAssetsByHolders: StellarAsset[];
  }> {
    const assets = await this.assetRepo.getAssets(undefined, undefined, { limit: 50, order: 'desc' });
    const sorted = [...assets].sort((a, b) => b.numAccounts - a.numAccounts);

    return {
      totalAssetsTracked: assets.length,
      topAssetsByHolders: sorted.slice(0, 10),
    };
  }
}

