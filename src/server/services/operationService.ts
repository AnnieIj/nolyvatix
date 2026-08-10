/**
 * Nolyvatix Data Engine - Operation Service
 */

import { OperationRepository } from '../repositories/operationRepository.ts';
import { StellarOperation, PaginationParams } from '../types/stellar.ts';

export class OperationService {
  private opRepo: OperationRepository;

  constructor(opRepo: OperationRepository) {
    this.opRepo = opRepo;
  }

  public async getOperations(params?: PaginationParams): Promise<StellarOperation[]> {
    return this.opRepo.getOperations(params);
  }

  public async getOperationById(id: string): Promise<StellarOperation> {
    return this.opRepo.getOperationById(id);
  }

  public async getOperationsByTransaction(transactionHash: string, params?: PaginationParams): Promise<StellarOperation[]> {
    return this.opRepo.getOperationsByTransaction(transactionHash, params);
  }

  public async getOperationsByAccount(accountId: string, params?: PaginationParams): Promise<StellarOperation[]> {
    return this.opRepo.getOperationsByAccount(accountId, params);
  }
}
