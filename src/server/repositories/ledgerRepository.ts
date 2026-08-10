/**
 * Nolyvatix Data Engine - Ledger Repository
 */

import { HorizonClient } from '../clients/horizonClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { StellarLedger, PaginationParams } from '../types/stellar.js';
import { NotFoundError } from '../utils/errors.js';

export interface HorizonLedgerRaw {
  id: string;
  sequence: number;
  hash: string;
  prev_hash: string;
  transaction_count: number;
  successful_transaction_count: number;
  failed_transaction_count: number;
  operation_count: number;
  tx_set_operation_count: number;
  closed_at: string;
  total_coins: string;
  fee_pool: string;
  base_fee_in_stroops: number;
  base_reserve_in_stroops: number;
  max_tx_set_size: number;
  protocol_version: number;
  header_xdr: string;
}

export interface HorizonEmbeddedLedgers {
  _embedded: {
    records: HorizonLedgerRaw[];
  };
}

export class LedgerRepository {
  private horizonClient: HorizonClient;
  private cache: MemoryCache;

  constructor(horizonClient: HorizonClient, cache: MemoryCache) {
    this.horizonClient = horizonClient;
    this.cache = cache;
  }

  public mapRawLedger(raw: HorizonLedgerRaw): StellarLedger {
    return {
      id: raw.id,
      sequence: raw.sequence,
      hash: raw.hash,
      prevHash: raw.prev_hash,
      transactionCount: raw.transaction_count,
      successfulTransactionCount: raw.successful_transaction_count,
      failedTransactionCount: raw.failed_transaction_count,
      operationCount: raw.operation_count,
      txSetOperationCount: raw.tx_set_operation_count,
      closedAt: raw.closed_at,
      totalCoins: raw.total_coins,
      feePool: raw.fee_pool,
      baseFee: raw.base_fee_in_stroops,
      baseReserve: raw.base_reserve_in_stroops,
      maxTxSetSize: raw.max_tx_set_size,
      protocolVersion: raw.protocol_version,
      headerXdr: raw.header_xdr,
    };
  }

  public async getLatestLedgers(params?: PaginationParams): Promise<StellarLedger[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `ledgers_latest_${queryParams.cursor}_${queryParams.order}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedLedgers>('/ledgers', queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawLedger(r));
    }, 5);
  }

  public async getLedgerBySequence(sequence: number): Promise<StellarLedger> {
    const cacheKey = `ledger_seq_${sequence}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<HorizonLedgerRaw>(`/ledgers/${sequence}`);
        return this.mapRawLedger(raw);
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw new NotFoundError('Ledger', sequence);
        }
        throw err;
      }
    }, 60);
  }
}
