/**
 * Nolyvatix Data Engine - Account Repository
 */

import { HorizonClient } from '../clients/horizonClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { StellarAccount, AccountBalance, AccountSigner } from '../types/stellar.js';
import { NotFoundError } from '../utils/errors.js';

export interface HorizonAccountRaw {
  id: string;
  account_id: string;
  sequence: string;
  subaccount_count: number;
  inflation_destination?: string;
  balances: Array<{
    balance: string;
    buying_liabilities: string;
    selling_liabilities: string;
    limit?: string;
    asset_type: 'native' | 'credit_alphanum4' | 'credit_alphanum12' | 'liquidity_pool_shares';
    asset_code?: string;
    asset_issuer?: string;
    liquidity_pool_id?: string;
  }>;
  signers: Array<{
    weight: number;
    key: string;
    type: string;
  }>;
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
  data: Record<string, string>;
}

export class AccountRepository {
  private horizonClient: HorizonClient;
  private cache: MemoryCache;

  constructor(horizonClient: HorizonClient, cache: MemoryCache) {
    this.horizonClient = horizonClient;
    this.cache = cache;
  }

  public mapRawAccount(raw: HorizonAccountRaw): StellarAccount {
    const mappedBalances: AccountBalance[] = (raw.balances || []).map((b) => ({
      balance: b.balance,
      buyingLiabilities: b.buying_liabilities,
      sellingLiabilities: b.selling_liabilities,
      limit: b.limit,
      assetType: b.asset_type,
      assetCode: b.asset_code,
      assetIssuer: b.asset_issuer,
      liquidityPoolId: b.liquidity_pool_id,
    }));

    const mappedSigners: AccountSigner[] = (raw.signers || []).map((s) => ({
      weight: s.weight,
      key: s.key,
      type: s.type,
    }));

    return {
      id: raw.id,
      accountId: raw.account_id,
      sequence: raw.sequence,
      subaccountCount: raw.subaccount_count,
      inflationDestination: raw.inflation_destination,
      balances: mappedBalances,
      signers: mappedSigners,
      flags: {
        authRequired: raw.flags?.auth_required || false,
        authRevocable: raw.flags?.auth_revocable || false,
        authImmutable: raw.flags?.auth_immutable || false,
        authClawbackEnabled: raw.flags?.auth_clawback_enabled || false,
      },
      thresholds: {
        lowThreshold: raw.thresholds?.low_threshold || 0,
        medThreshold: raw.thresholds?.med_threshold || 0,
        highThreshold: raw.thresholds?.high_threshold || 0,
      },
      data: raw.data || {},
    };
  }

  public async getAccountById(accountId: string): Promise<StellarAccount> {
    const cacheKey = `account_${accountId}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<HorizonAccountRaw>(`/accounts/${accountId}`);
        return this.mapRawAccount(raw);
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw new NotFoundError('Account', accountId);
        }
        throw err;
      }
    }, 15);
  }
}
