/**
 * Nolyvatix Data Engine - Transaction Repository
 */

import { HorizonClient } from '../clients/horizonClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { StellarTransaction, PaginationParams } from '../types/stellar.js';
import { NotFoundError } from '../utils/errors.js';

export interface HorizonTransactionRaw {
  id: string;
  hash: string;
  ledger: number;
  created_at: string;
  source_account: string;
  source_account_sequence: string;
  fee_charged: number;
  max_fee: number;
  operation_count: number;
  memo?: string;
  memo_type?: 'none' | 'text' | 'id' | 'hash' | 'return';
  signatures: string[];
  successful: boolean;
  result_xdr: string;
  envelope_xdr: string;
  result_meta_xdr?: string;
  fee_bump_transaction?: {
    hash: string;
  };
}

export interface HorizonEmbeddedTransactions {
  _embedded: {
    records: HorizonTransactionRaw[];
  };
}

export class TransactionRepository {
  private horizonClient: HorizonClient;
  private cache: MemoryCache;

  constructor(horizonClient: HorizonClient, cache: MemoryCache) {
    this.horizonClient = horizonClient;
    this.cache = cache;
  }

  public mapRawTransaction(raw: HorizonTransactionRaw): StellarTransaction {
    return {
      id: raw.id,
      hash: raw.hash,
      ledgerSequence: raw.ledger,
      createdAt: raw.created_at,
      sourceAccount: raw.source_account,
      sourceAccountSequence: raw.source_account_sequence,
      feeCharged: raw.fee_charged,
      maxFee: raw.max_fee,
      operationCount: raw.operation_count,
      memo: raw.memo,
      memoType: raw.memo_type,
      signatures: raw.signatures || [],
      successful: raw.successful,
      resultXdr: raw.result_xdr,
      envelopeXdr: raw.envelope_xdr,
      resultMetaXdr: raw.result_meta_xdr,
      feeBump: !!raw.fee_bump_transaction,
      innerTransactionHash: raw.fee_bump_transaction?.hash,
    };
  }

  public async getTransactions(params?: PaginationParams): Promise<StellarTransaction[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `txs_recent_${queryParams.cursor}_${queryParams.order}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedTransactions>('/transactions', queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawTransaction(r));
    }, 5);
  }

  public async getTransactionByHash(hash: string): Promise<StellarTransaction> {
    const cacheKey = `tx_hash_${hash}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<HorizonTransactionRaw>(`/transactions/${hash}`);
        return this.mapRawTransaction(raw);
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw new NotFoundError('Transaction', hash);
        }
        throw err;
      }
    }, 120);
  }

  public async getTransactionsByLedger(sequence: number, params?: PaginationParams): Promise<StellarTransaction[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `txs_ledger_${sequence}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedTransactions>(`/ledgers/${sequence}/transactions`, queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawTransaction(r));
    }, 60);
  }

  public async getTransactionsByAccount(accountId: string, params?: PaginationParams): Promise<StellarTransaction[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `txs_account_${accountId}_${queryParams.cursor}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedTransactions>(`/accounts/${accountId}/transactions`, queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawTransaction(r));
    }, 10);
  }
}
