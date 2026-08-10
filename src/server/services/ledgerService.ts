/**
 * Nolyvatix Data Engine - Ledger Service
 */

import { LedgerRepository } from '../repositories/ledgerRepository.ts';
import { StellarLedger, PaginationParams } from '../types/stellar.ts';

export class LedgerService {
  private ledgerRepo: LedgerRepository;

  constructor(ledgerRepo: LedgerRepository) {
    this.ledgerRepo = ledgerRepo;
  }

  public async getLatestLedgers(params?: PaginationParams): Promise<StellarLedger[]> {
    return this.ledgerRepo.getLatestLedgers(params);
  }

  public async getLedgerBySequence(sequence: number): Promise<StellarLedger> {
    return this.ledgerRepo.getLedgerBySequence(sequence);
  }

  public async getLedgerMetrics(): Promise<{
    currentSequence: number;
    avgCloseTimeSeconds: number;
    tps: number;
    totalTransactionsLast20Ledgers: number;
  }> {
    const latestLedgers = await this.ledgerRepo.getLatestLedgers({ limit: 20, order: 'desc' });
    if (latestLedgers.length < 2) {
      return {
        currentSequence: latestLedgers[0]?.sequence || 0,
        avgCloseTimeSeconds: 5.0,
        tps: 0,
        totalTransactionsLast20Ledgers: 0,
      };
    }

    const currentSequence = latestLedgers[0].sequence;
    const totalTransactions = latestLedgers.reduce((acc, l) => acc + l.transactionCount, 0);

    const newestTime = new Date(latestLedgers[0].closedAt).getTime();
    const oldestTime = new Date(latestLedgers[latestLedgers.length - 1].closedAt).getTime();
    const timeSpanSeconds = Math.max((newestTime - oldestTime) / 1000, 1);

    const avgCloseTimeSeconds = timeSpanSeconds / (latestLedgers.length - 1);
    const tps = parseFloat((totalTransactions / timeSpanSeconds).toFixed(2));

    return {
      currentSequence,
      avgCloseTimeSeconds: parseFloat(avgCloseTimeSeconds.toFixed(2)),
      tps,
      totalTransactionsLast20Ledgers: totalTransactions,
    };
  }
}
