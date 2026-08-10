/**
 * Nolyvatix Data Engine - Account Service
 */

import { AccountRepository } from '../repositories/accountRepository.ts';
import { TransactionRepository } from '../repositories/transactionRepository.ts';
import { OperationRepository } from '../repositories/operationRepository.ts';
import { StellarAccount, StellarTransaction, StellarOperation, PaginationParams } from '../types/stellar.ts';

export class AccountService {
  private accountRepo: AccountRepository;
  private txRepo: TransactionRepository;
  private opRepo: OperationRepository;

  constructor(
    accountRepo: AccountRepository,
    txRepo: TransactionRepository,
    opRepo: OperationRepository
  ) {
    this.accountRepo = accountRepo;
    this.txRepo = txRepo;
    this.opRepo = opRepo;
  }

  public async getAccount(accountId: string): Promise<StellarAccount> {
    return this.accountRepo.getAccountById(accountId);
  }

  public async getAccountTransactions(accountId: string, params?: PaginationParams): Promise<StellarTransaction[]> {
    return this.txRepo.getTransactionsByAccount(accountId, params);
  }

  public async getAccountOperations(accountId: string, params?: PaginationParams): Promise<StellarOperation[]> {
    return this.opRepo.getOperationsByAccount(accountId, params);
  }

  public async getAccountPayments(accountId: string, params?: PaginationParams): Promise<StellarOperation[]> {
    return this.opRepo.getPaymentsByAccount(accountId, params);
  }

  public async getAccountAnalytics(accountId: string): Promise<any> {
    const account = await this.accountRepo.getAccountById(accountId);

    let transactions: StellarTransaction[] = [];
    let operations: StellarOperation[] = [];
    let payments: StellarOperation[] = [];

    try {
      transactions = await this.txRepo.getTransactionsByAccount(accountId, { limit: 100 });
    } catch {
      transactions = [];
    }

    try {
      operations = await this.opRepo.getOperationsByAccount(accountId, { limit: 100 });
    } catch {
      operations = [];
    }

    try {
      payments = await this.opRepo.getPaymentsByAccount(accountId, { limit: 100 });
    } catch {
      payments = [];
    }

    // Balances calculation
    const nativeBalObj = account.balances.find((b) => b.assetType === 'native');
    const nativeBalance = parseFloat(nativeBalObj?.balance || '0');
    const baseReserve = 0.5 + (account.subaccountCount || 0) * 0.5;
    const availableBalance = Math.max(0, nativeBalance - baseReserve);

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

    const totalAssetsCount = account.balances.length;
    const trustlinesCount = trustlines.length;

    // Asset allocation
    const totalBalanceVal = nativeBalance + trustlines.reduce((sum, t) => sum + (t.balance > 0 ? t.balance : 0), 0);
    const assetAllocations = account.balances.map((b) => {
      const balNum = parseFloat(b.balance || '0');
      const isNative = b.assetType === 'native';
      const code = isNative ? 'XLM' : b.assetCode || 'TOKEN';
      const pct = totalBalanceVal > 0 ? (balNum / totalBalanceVal) * 100 : isNative ? 100 : 0;
      return {
        code,
        issuer: b.assetIssuer,
        balance: balNum,
        percentage: parseFloat(pct.toFixed(1)),
        isNative,
      };
    });

    // Transaction & operation stats
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter((t) => t.successful).length;
    const failedTransactions = totalTransactions - successfulTransactions;
    const successRate = totalTransactions > 0 ? parseFloat(((successfulTransactions / totalTransactions) * 100).toFixed(1)) : 100;

    // Incoming vs Outgoing payments
    let incomingCount = 0;
    let incomingVolume = 0;
    let outgoingCount = 0;
    let outgoingVolume = 0;
    let largestPayment = 0;
    let totalPaymentVol = 0;

    const counterpartyMap: Record<string, { address: string; count: number; volume: number; direction: 'incoming' | 'outgoing' | 'mixed' }> = {};

    payments.forEach((op) => {
      let amt = 0;
      if ('amount' in op && typeof op.amount === 'string') {
        amt = parseFloat(op.amount) || 0;
      } else if ('startingBalance' in op && typeof op.startingBalance === 'string') {
        amt = parseFloat(op.startingBalance) || 0;
      }

      if (amt > largestPayment) {
        largestPayment = amt;
      }

      totalPaymentVol += amt;

      const isIncoming = 'to' in op && op.to === accountId;
      const isOutgoing = ('from' in op && op.from === accountId) || op.sourceAccount === accountId;

      if (isIncoming) {
        incomingCount++;
        incomingVolume += amt;
        const sender = op.sourceAccount || ('from' in op ? (op.from as string) : 'Unknown');
        if (sender && sender !== accountId) {
          if (!counterpartyMap[sender]) {
            counterpartyMap[sender] = { address: sender, count: 0, volume: 0, direction: 'incoming' };
          }
          counterpartyMap[sender].count++;
          counterpartyMap[sender].volume += amt;
        }
      } else if (isOutgoing) {
        outgoingCount++;
        outgoingVolume += amt;
        const recipient = 'to' in op ? (op.to as string) : 'account' in op ? (op.account as string) : 'Unknown';
        if (recipient && recipient !== accountId) {
          if (!counterpartyMap[recipient]) {
            counterpartyMap[recipient] = { address: recipient, count: 0, volume: 0, direction: 'outgoing' };
          }
          counterpartyMap[recipient].count++;
          counterpartyMap[recipient].volume += amt;
        }
      }
    });

    const totalPaymentOps = incomingCount + outgoingCount;
    const averageTransactionSize = totalPaymentOps > 0 ? parseFloat((totalPaymentVol / totalPaymentOps).toFixed(2)) : 0;

    // Active days count
    const uniqueDates = new Set<string>();
    operations.forEach((op) => {
      if (op.createdAt) {
        uniqueDates.add(op.createdAt.substring(0, 10));
      }
    });
    const activeDaysCount = Math.max(1, uniqueDates.size);

    // Operations breakdown
    const opTypeCounts: Record<string, number> = {};
    operations.forEach((op) => {
      const typeStr = op.type || 'unknown';
      opTypeCounts[typeStr] = (opTypeCounts[typeStr] || 0) + 1;
    });

    const totalOps = operations.length || 1;
    const operationsBreakdown = Object.entries(opTypeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: parseFloat(((count / totalOps) * 100).toFixed(1)),
    }));

    // Top counterparties
    const topCounterparties = Object.values(counterpartyMap)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
      .map((c) => ({
        address: c.address,
        count: c.count,
        volumeXLM: parseFloat(c.volume.toFixed(2)),
        direction: c.direction,
      }));

    // Asset diversity score (0-100)
    const assetDiversityScore = Math.min(100, trustlinesCount * 20 + Object.keys(opTypeCounts).length * 10 + Math.min(30, totalTransactions));

    // Historical balance trend (construct estimated balance moving backwards)
    let runningBal = nativeBalance;
    const trendPoints: Array<{ date: string; balance: number }> = [];

    // Sort operations chronologically
    const sortedOps = [...operations].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (sortedOps.length === 0) {
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        trendPoints.push({
          date: d.toISOString().substring(5, 10),
          balance: parseFloat((nativeBalance * (0.95 + (i % 3) * 0.02)).toFixed(2)),
        });
      }
    } else {
      sortedOps.forEach((op) => {
        const dateStr = new Date(op.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let delta = 0;
        if (op.type === 'payment') {
          const amt = parseFloat(('amount' in op ? op.amount : '0') as string) || 0;
          if ('to' in op && op.to === accountId) delta = amt;
          else delta = -amt;
        } else if (op.type === 'create_account') {
          const amt = parseFloat(('startingBalance' in op ? op.startingBalance : '0') as string) || 0;
          delta = amt;
        }
        runningBal += delta;
        trendPoints.push({
          date: dateStr,
          balance: parseFloat(Math.max(0, runningBal).toFixed(2)),
        });
      });
    }

    // Activity timeline
    const activityTimeline = operations.slice(0, 30).map((op) => ({
      id: op.id,
      type: op.type,
      timestamp: op.createdAt,
      transactionHash: op.transactionHash,
      sourceAccount: op.sourceAccount,
      details: op,
      successful: op.transactionSuccessful,
    }));

    return {
      account,
      summary: {
        accountId: account.accountId,
        sequence: account.sequence,
        subaccountCount: account.subaccountCount,
        homeDomain: account.data?.home_domain ? Buffer.from(account.data.home_domain, 'base64').toString('utf-8') : undefined,
        createdDate: sortedOps[0]?.createdAt || account.sequence ? 'Active' : 'N/A',
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        successRate,
        activeDaysCount,
      },
      balances: {
        nativeXlm: parseFloat(nativeBalance.toFixed(2)),
        nativeReserved: parseFloat(baseReserve.toFixed(2)),
        nativeAvailable: parseFloat(availableBalance.toFixed(2)),
        totalAssetsCount,
        trustlinesCount,
        assetAllocations,
      },
      trustlines,
      transactionStats: {
        totalTransactions,
        incomingPaymentsCount: incomingCount,
        incomingVolumeXLM: parseFloat(incomingVolume.toFixed(2)),
        outgoingPaymentsCount: outgoingCount,
        outgoingVolumeXLM: parseFloat(outgoingVolume.toFixed(2)),
        averageTransactionSizeXLM: averageTransactionSize,
        largestPaymentXLM: parseFloat(largestPayment.toFixed(2)),
        assetDiversityScore,
      },
      operationsBreakdown,
      topCounterparties,
      balanceHistory: trendPoints,
      activityTimeline,
    };
  }
}
