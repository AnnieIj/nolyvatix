/**
 * Nolyvatix Data Engine - Transaction Service
 */

import { TransactionRepository } from '../repositories/transactionRepository.ts';
import { StellarTransaction, PaginationParams } from '../types/stellar.ts';

export class TransactionService {
  private txRepo: TransactionRepository;

  constructor(txRepo: TransactionRepository) {
    this.txRepo = txRepo;
  }

  public async getTransactions(params?: PaginationParams): Promise<StellarTransaction[]> {
    return this.txRepo.getTransactions(params);
  }

  public async getTransactionByHash(hash: string): Promise<StellarTransaction> {
    return this.txRepo.getTransactionByHash(hash);
  }

  public async getTransactionsByLedger(sequence: number, params?: PaginationParams): Promise<StellarTransaction[]> {
    return this.txRepo.getTransactionsByLedger(sequence, params);
  }

  public async getTransactionsByAccount(accountId: string, params?: PaginationParams): Promise<StellarTransaction[]> {
    return this.txRepo.getTransactionsByAccount(accountId, params);
  }
}
