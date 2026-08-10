/**
 * Nolyvatix Data Engine - Operation Repository
 */

import { HorizonClient } from '../clients/horizonClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { StellarOperation, PaginationParams, OperationType } from '../types/stellar.js';
import { NotFoundError } from '../utils/errors.js';

export interface HorizonOperationRaw {
  id: string;
  paging_token: string;
  transaction_successful: boolean;
  source_account: string;
  type: string;
  type_i: number;
  created_at: string;
  transaction_hash: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  from?: string;
  to?: string;
  amount?: string;
  starting_balance?: string;
  funder?: string;
  account?: string;
  limit?: string;
  trustor?: string;
  trustee?: string;
  function?: string;
  [key: string]: unknown;
}

export interface HorizonEmbeddedOperations {
  _embedded: {
    records: HorizonOperationRaw[];
  };
}

export class OperationRepository {
  private horizonClient: HorizonClient;
  private cache: MemoryCache;

  constructor(horizonClient: HorizonClient, cache: MemoryCache) {
    this.horizonClient = horizonClient;
    this.cache = cache;
  }

  public mapRawOperation(raw: HorizonOperationRaw): StellarOperation {
    const base = {
      id: raw.id,
      pagingToken: raw.paging_token,
      transactionHash: raw.transaction_hash,
      transactionSuccessful: raw.transaction_successful,
      sourceAccount: raw.source_account,
      type: raw.type as OperationType,
      typeI: raw.type_i,
      createdAt: raw.created_at,
    };

    if (raw.type === 'payment') {
      return {
        ...base,
        type: 'payment',
        assetType: raw.asset_type || 'native',
        assetCode: raw.asset_code,
        assetIssuer: raw.asset_issuer,
        from: raw.from || raw.source_account,
        to: raw.to || '',
        amount: raw.amount || '0',
      };
    }

    if (raw.type === 'create_account') {
      return {
        ...base,
        type: 'create_account',
        funder: raw.funder || raw.source_account,
        account: raw.account || '',
        startingBalance: raw.starting_balance || '0',
      };
    }

    if (raw.type === 'change_trust') {
      return {
        ...base,
        type: 'change_trust',
        assetType: raw.asset_type || 'credit_alphanum4',
        assetCode: raw.asset_code,
        assetIssuer: raw.asset_issuer,
        limit: raw.limit || '0',
        trustor: raw.trustor || raw.source_account,
        trustee: raw.trustee,
      };
    }

    if (raw.type === 'invoke_host_function') {
      return {
        ...base,
        type: 'invoke_host_function',
        function: raw.function || 'HostFunctionTypeInvokeContract',
        address: (raw.address as string) || undefined,
        salt: (raw.salt as string) || undefined,
      };
    }

    return {
      ...raw,
      ...base,
      type: (raw.type as OperationType) || 'payment',
    } as StellarOperation;
  }

  public async getOperations(params?: PaginationParams): Promise<StellarOperation[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `ops_recent_${queryParams.cursor}_${queryParams.order}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedOperations>('/operations', queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawOperation(r));
    }, 5);
  }

  public async getOperationById(id: string): Promise<StellarOperation> {
    const cacheKey = `op_id_${id}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<HorizonOperationRaw>(`/operations/${id}`);
        return this.mapRawOperation(raw);
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw new NotFoundError('Operation', id);
        }
        throw err;
      }
    }, 120);
  }

  public async getOperationsByTransaction(transactionHash: string, params?: PaginationParams): Promise<StellarOperation[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `ops_tx_${transactionHash}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedOperations>(`/transactions/${transactionHash}/operations`, queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawOperation(r));
    }, 60);
  }

  public async getOperationsByAccount(accountId: string, params?: PaginationParams): Promise<StellarOperation[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `ops_account_${accountId}_${queryParams.cursor}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<HorizonEmbeddedOperations>(`/accounts/${accountId}/operations`, queryParams);
      return (raw._embedded?.records || []).map((r) => this.mapRawOperation(r));
    }, 10);
  }

  public async getPaymentsByAccount(accountId: string, params?: PaginationParams): Promise<StellarOperation[]> {
    const queryParams = this.horizonClient.buildPaginationParams(params);
    const cacheKey = `payments_account_${accountId}_${queryParams.cursor}_${queryParams.limit}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<HorizonEmbeddedOperations>(`/accounts/${accountId}/payments`, queryParams);
        return (raw._embedded?.records || []).map((r) => this.mapRawOperation(r));
      } catch {
        const allOps = await this.getOperationsByAccount(accountId, params);
        return allOps.filter((op) => ['payment', 'create_account', 'path_payment_strict_send', 'path_payment_strict_receive', 'account_merge'].includes(op.type));
      }
    }, 10);
  }
}
