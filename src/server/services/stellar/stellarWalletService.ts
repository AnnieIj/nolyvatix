/**
 * Nolyvatix Data Engine - Stellar Live Wallet Intelligence Service
 * Computes deep on-chain analytics, asset distributions, counterparty matrices,
 * payment velocities, base reserve math, and historical balances from Horizon.
 */

import { StellarHorizonClient } from './horizonClient.js';
import { StellarCache } from '../../cache/stellarCache.js';
import {
  StellarAccount,
  StellarTransaction,
  StellarOperation,
  PaginationParams,
} from '../../types/stellar.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('StellarWalletService');

export interface WalletPortfolioAnalytics {
  account: StellarAccount;
  balances: {
    native: number;
    availableNative: number;
    baseReserveRequired: number;
    totalAssetsCount: number;
    trustlinesCount: number;
    trustlines: Array<{
      assetCode: string;
      assetIssuer: string;
      assetType: string;
      balance: number;
      limit: string;
      buyingLiabilities: string;
      sellingLiabilities: string;
      isAuthorized: boolean;
      isClawbackEnabled: boolean;
    }>;
    assetAllocations: Array<{
      code: string;
      issuer?: string;
      balance: number;
      percentage: number;
    }>;
  };
  activity: {
    totalTransactionsCount: number;
    totalOperationsCount: number;
    totalPaymentsCount: number;
    successfulTxCount: number;
    failedTxCount: number;
    successRate: number;
    totalFeeSpentXLM: number;
    firstActivityDate?: string;
    lastActivityDate?: string;
    recentTransactions: StellarTransaction[];
    recentPayments: StellarOperation[];
  };
  counterparties: Array<{
    address: string;
    type: 'inbound' | 'outbound' | 'bidirectional';
    txCount: number;
    totalVolumeXLM: number;
    lastInteraction: string;
  }>;
  riskProfile: {
    score: number; // 0-100 (higher = safer)
    riskLevel: 'Low' | 'Medium' | 'High';
    factors: string[];
    isMultisig: boolean;
    signersCount: number;
    hasClawbackAssets: boolean;
  };
}

export class StellarWalletService {
  private horizonClient: StellarHorizonClient;
  private cache: StellarCache;

  constructor(horizonClient: StellarHorizonClient, cache: StellarCache) {
    this.horizonClient = horizonClient;
    this.cache = cache;
  }

  public async getAccount(accountId: string): Promise<StellarAccount> {
    const cacheKey = `wallet_account_${accountId}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const raw = await this.horizonClient.request<any>(`/accounts/${accountId}`);
      return this.mapRawAccount(raw);
    }, 10);
  }

  public async getAccountTransactions(accountId: string, params?: PaginationParams): Promise<StellarTransaction[]> {
    const limit = Math.min(params?.limit || 50, 200);
    const order = params?.order || 'desc';
    const query: Record<string, unknown> = { limit, order };
    if (params?.cursor) query.cursor = params.cursor;

    const cacheKey = `wallet_txs_${accountId}_${JSON.stringify(query)}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<{ _embedded: { records: any[] } }>(
          `/accounts/${accountId}/transactions`,
          query
        );
        return (raw._embedded?.records || []).map((r) => this.mapRawTransaction(r));
      } catch (err) {
        logger.warn(`Failed to fetch transactions for account ${accountId}`, { error: err });
        return [];
      }
    }, 10);
  }

  public async getAccountOperations(accountId: string, params?: PaginationParams): Promise<StellarOperation[]> {
    const limit = Math.min(params?.limit || 50, 200);
    const order = params?.order || 'desc';
    const query: Record<string, unknown> = { limit, order };
    if (params?.cursor) query.cursor = params.cursor;

    const cacheKey = `wallet_ops_${accountId}_${JSON.stringify(query)}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<{ _embedded: { records: any[] } }>(
          `/accounts/${accountId}/operations`,
          query
        );
        return (raw._embedded?.records || []).map((r) => this.mapRawOperation(r));
      } catch (err) {
        logger.warn(`Failed to fetch operations for account ${accountId}`, { error: err });
        return [];
      }
    }, 10);
  }

  public async getAccountPayments(accountId: string, params?: PaginationParams): Promise<StellarOperation[]> {
    const limit = Math.min(params?.limit || 50, 200);
    const order = params?.order || 'desc';
    const query: Record<string, unknown> = { limit, order };
    if (params?.cursor) query.cursor = params.cursor;

    const cacheKey = `wallet_payments_${accountId}_${JSON.stringify(query)}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      try {
        const raw = await this.horizonClient.request<{ _embedded: { records: any[] } }>(
          `/accounts/${accountId}/payments`,
          query
        );
        return (raw._embedded?.records || []).map((r) => this.mapRawOperation(r));
      } catch (err) {
        logger.warn(`Failed to fetch payments for account ${accountId}`, { error: err });
        return [];
      }
    }, 10);
  }

  public async getWalletAnalytics(accountId: string): Promise<WalletPortfolioAnalytics> {
    const cacheKey = `wallet_analytics_${accountId}_${this.horizonClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const account = await this.getAccount(accountId);

      const [transactions, operations, payments] = await Promise.all([
        this.getAccountTransactions(accountId, { limit: 100 }).catch(() => []),
        this.getAccountOperations(accountId, { limit: 100 }).catch(() => []),
        this.getAccountPayments(accountId, { limit: 100 }).catch(() => []),
      ]);

      // Base Reserve & Native Balance calculation
      const nativeBalObj = account.balances.find((b) => b.assetType === 'native');
      const nativeBalance = parseFloat(nativeBalObj?.balance || '0');
      const subentriesCount = account.subaccountCount || 0;
      const signersCount = account.signers.length;
      // Stellar base reserve formula: 2 * baseReserve + (subentries + extra signers) * baseReserve
      const baseReservePerEntry = 0.5;
      const baseReserveRequired = (2 + subentriesCount + Math.max(0, signersCount - 1)) * baseReservePerEntry;
      const availableNative = Math.max(0, nativeBalance - baseReserveRequired);

      const trustlines = account.balances
        .filter((b) => b.assetType !== 'native')
        .map((b) => ({
          assetCode: b.assetCode || 'UNKNOWN',
          assetIssuer: b.assetIssuer || 'N/A',
          assetType: b.assetType,
          balance: parseFloat(b.balance || '0'),
          limit: b.limit || '0',
          buyingLiabilities: b.buyingLiabilities || '0',
          sellingLiabilities: b.sellingLiabilities || '0',
          isAuthorized: account.flags.authRequired ? !account.flags.authRevocable : true,
          isClawbackEnabled: account.flags.authClawbackEnabled || false,
        }));

      const totalBalanceUnits =
        nativeBalance + trustlines.reduce((acc, cur) => acc + (cur.balance > 0 ? cur.balance : 0), 0);

      const assetAllocations = account.balances.map((b) => {
        const bal = parseFloat(b.balance || '0');
        const code = b.assetType === 'native' ? 'XLM' : b.assetCode || 'TOKEN';
        const pct = totalBalanceUnits > 0 ? (bal / totalBalanceUnits) * 100 : b.assetType === 'native' ? 100 : 0;
        return {
          code,
          issuer: b.assetIssuer,
          balance: bal,
          percentage: parseFloat(pct.toFixed(1)),
        };
      });

      // Activity aggregation
      const successfulTxs = transactions.filter((t) => t.successful).length;
      const failedTxs = transactions.length - successfulTxs;
      const successRate = transactions.length > 0 ? parseFloat(((successfulTxs / transactions.length) * 100).toFixed(1)) : 100;
      let totalFeeSpentXLM = 0;
      for (const t of transactions) {
        totalFeeSpentXLM += ((t.feeCharged || 0) / 10000000);
      }

      const sortedTxs = [...transactions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const firstActivityDate = sortedTxs.length > 0 ? sortedTxs[0].createdAt : undefined;
      const lastActivityDate = sortedTxs.length > 0 ? sortedTxs[sortedTxs.length - 1].createdAt : undefined;

      // Counterparties map
      const counterpartiesMap = new Map<
        string,
        { type: 'inbound' | 'outbound' | 'bidirectional'; txCount: number; totalVolume: number; lastDate: string }
      >();

      payments.forEach((p: any) => {
        const from = p.from || p.sourceAccount;
        const to = p.to || p.destinationAccount;
        const amount = parseFloat(p.amount || '0');
        const otherAddress = from === accountId ? to : from;

        if (otherAddress && otherAddress !== accountId) {
          const existing = counterpartiesMap.get(otherAddress);
          const isOutbound = from === accountId;

          if (!existing) {
            counterpartiesMap.set(otherAddress, {
              type: isOutbound ? 'outbound' : 'inbound',
              txCount: 1,
              totalVolume: amount,
              lastDate: p.createdAt,
            });
          } else {
            existing.txCount++;
            existing.totalVolume += amount;
            if (
              (existing.type === 'outbound' && !isOutbound) ||
              (existing.type === 'inbound' && isOutbound)
            ) {
              existing.type = 'bidirectional';
            }
            if (new Date(p.createdAt) > new Date(existing.lastDate)) {
              existing.lastDate = p.createdAt;
            }
          }
        }
      });

      const counterparties = Array.from(counterpartiesMap.entries())
        .map(([address, data]) => ({
          address,
          type: data.type,
          txCount: data.txCount,
          totalVolumeXLM: parseFloat(data.totalVolume.toFixed(2)),
          lastInteraction: data.lastDate,
        }))
        .sort((a, b) => b.txCount - a.txCount)
        .slice(0, 10);

      // Risk Profile Assessment
      const isMultisig = signersCount > 1;
      const hasClawbackAssets = trustlines.some((t) => t.isClawbackEnabled);
      let riskScore = 90;
      const factors: string[] = [];

      if (isMultisig) {
        riskScore += 5;
        factors.push(`Multi-signature enabled with ${signersCount} signers`);
      } else {
        factors.push('Single-signature account (Standard key custody)');
      }

      if (failedTxs > 5) {
        riskScore -= 10;
        factors.push('Elevated failed transaction frequency detected');
      }

      if (nativeBalance < 1.0) {
        riskScore -= 15;
        factors.push('Critically low native XLM balance close to reserve threshold');
      }

      if (trustlines.length > 20) {
        riskScore -= 5;
        factors.push('High number of trustlines active on account');
      }

      const finalScore = Math.max(10, Math.min(100, riskScore));
      const riskLevel = finalScore >= 80 ? 'Low' : finalScore >= 50 ? 'Medium' : 'High';

      return {
        account,
        balances: {
          native: nativeBalance,
          availableNative: parseFloat(availableNative.toFixed(4)),
          baseReserveRequired: parseFloat(baseReserveRequired.toFixed(4)),
          totalAssetsCount: account.balances.length,
          trustlinesCount: trustlines.length,
          trustlines,
          assetAllocations,
        },
        activity: {
          totalTransactionsCount: transactions.length,
          totalOperationsCount: operations.length,
          totalPaymentsCount: payments.length,
          successfulTxCount: successfulTxs,
          failedTxCount: failedTxs,
          successRate,
          totalFeeSpentXLM: parseFloat(totalFeeSpentXLM.toFixed(6)),
          firstActivityDate,
          lastActivityDate,
          recentTransactions: transactions.slice(0, 20),
          recentPayments: payments.slice(0, 20),
        },
        counterparties,
        riskProfile: {
          score: finalScore,
          riskLevel,
          factors,
          isMultisig,
          signersCount,
          hasClawbackAssets,
        },
      };
    }, 15);
  }

  private mapRawAccount(raw: any): StellarAccount {
    return {
      id: raw.id,
      accountId: raw.account_id,
      sequence: raw.sequence,
      subaccountCount: raw.subaccount_count || 0,
      inflationDestination: raw.inflation_destination,
      balances: (raw.balances || []).map((b: any) => ({
        balance: b.balance,
        buyingLiabilities: b.buying_liabilities || '0',
        sellingLiabilities: b.selling_liabilities || '0',
        limit: b.limit,
        assetType: b.asset_type,
        assetCode: b.asset_code,
        assetIssuer: b.asset_issuer,
        liquidityPoolId: b.liquidity_pool_id,
      })),
      signers: (raw.signers || []).map((s: any) => ({
        weight: s.weight,
        key: s.key,
        type: s.type,
      })),
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

  private mapRawTransaction(raw: any): StellarTransaction {
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
    };
  }

  private mapRawOperation(raw: any): StellarOperation {
    return {
      id: raw.id,
      pagingToken: raw.paging_token,
      transactionHash: raw.transaction_hash,
      transactionSuccessful: raw.transaction_successful,
      sourceAccount: raw.source_account,
      type: raw.type,
      typeI: raw.type_i,
      createdAt: raw.created_at,
      ...raw,
    };
  }
}
