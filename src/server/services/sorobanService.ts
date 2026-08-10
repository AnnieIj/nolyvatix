/**
 * Nolyvatix Data Engine - Soroban Service
 */

import { SorobanRepository } from '../repositories/sorobanRepository.ts';
import { SorobanClient } from '../clients/sorobanClient.ts';
import { SorobanEvent, SorobanContractSummary } from '../types/stellar.ts';

export class SorobanService {
  private sorobanRepo: SorobanRepository;
  private sorobanClient: SorobanClient;

  constructor(sorobanRepo: SorobanRepository, sorobanClient: SorobanClient) {
    this.sorobanRepo = sorobanRepo;
    this.sorobanClient = sorobanClient;
  }

  public async getSorobanEvents(contractId?: string, startLedger?: number): Promise<SorobanEvent[]> {
    return this.sorobanRepo.getSorobanEvents(contractId, startLedger);
  }

  public async getContractSummary(contractId: string): Promise<SorobanContractSummary> {
    return this.sorobanRepo.getContractSummary(contractId);
  }

  public async getHealth(): Promise<{ status: string; latestLedger: number }> {
    return this.sorobanClient.getHealth();
  }
}
