/**
 * Nolyvatix Data Engine - Soroban Repository
 */

import { SorobanClient } from '../clients/sorobanClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { SorobanEvent, SorobanContractSummary } from '../types/stellar.js';

export class SorobanRepository {
  private sorobanClient: SorobanClient;
  private cache: MemoryCache;

  constructor(sorobanClient: SorobanClient, cache: MemoryCache) {
    this.sorobanClient = sorobanClient;
    this.cache = cache;
  }

  public async getSorobanEvents(contractId?: string, startLedger?: number): Promise<SorobanEvent[]> {
    const cacheKey = `soroban_events_${contractId}_${startLedger}_${this.sorobanClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const res = await this.sorobanClient.getEvents({
        startLedger,
        filters: contractId ? [{ contractIds: [contractId] }] : [],
        pagination: { limit: 50 },
      });
      return res.events;
    }, 10);
  }

  public async getContractSummary(contractId: string): Promise<SorobanContractSummary> {
    const cacheKey = `soroban_contract_${contractId}_${this.sorobanClient.getNetwork()}`;

    return this.cache.getOrFetch(cacheKey, async () => {
      const events = await this.getSorobanEvents(contractId);
      const lastInvocation = events.length > 0 ? events[0].ledger : undefined;

      return {
        contractId,
        status: 'active',
        lastInvocationLedger: lastInvocation,
        totalInvocations24h: events.length,
        estimatedCpuInstructions: 154000,
        estimatedMemoryBytes: 4096,
      };
    }, 30);
  }
}
