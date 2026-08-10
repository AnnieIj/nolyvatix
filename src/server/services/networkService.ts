/**
 * Nolyvatix Data Engine - Network Service
 */

import { HorizonClient } from '../clients/horizonClient.ts';
import { SorobanClient } from '../clients/sorobanClient.ts';
import { LedgerService } from './ledgerService.ts';
import { NetworkHealth } from '../types/stellar.ts';

export class NetworkService {
  private horizonClient: HorizonClient;
  private sorobanClient: SorobanClient;
  private ledgerService: LedgerService;

  constructor(
    horizonClient: HorizonClient,
    sorobanClient: SorobanClient,
    ledgerService: LedgerService
  ) {
    this.horizonClient = horizonClient;
    this.sorobanClient = sorobanClient;
    this.ledgerService = ledgerService;
  }

  public async getNetworkHealth(): Promise<NetworkHealth> {
    let horizonStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    let sorobanStatus: 'healthy' | 'degraded' | 'down' = 'healthy';

    let ledgerMetrics = {
      currentSequence: 0,
      avgCloseTimeSeconds: 5.0,
      tps: 0,
      totalTransactionsLast20Ledgers: 0,
    };

    let latestLedgerClosedAt = new Date().toISOString();
    let protocolVersion = 21;

    try {
      ledgerMetrics = await this.ledgerService.getLedgerMetrics();
      const latest = await this.ledgerService.getLatestLedgers({ limit: 1 });
      if (latest.length > 0) {
        latestLedgerClosedAt = latest[0].closedAt;
        protocolVersion = latest[0].protocolVersion;
      }
    } catch {
      horizonStatus = 'down';
    }

    try {
      const sorobanHealth = await this.sorobanClient.getHealth();
      if (sorobanHealth.status !== 'healthy' && sorobanHealth.status !== 'healthy_and_synced') {
        sorobanStatus = 'degraded';
      }
    } catch {
      sorobanStatus = 'down';
    }

    const overallStatus =
      horizonStatus === 'healthy' && sorobanStatus === 'healthy'
        ? 'healthy'
        : horizonStatus === 'down' || sorobanStatus === 'down'
        ? 'down'
        : 'degraded';

    return {
      status: overallStatus,
      network: this.horizonClient.getNetwork(),
      horizonStatus,
      sorobanRpcStatus: sorobanStatus,
      currentLedgerSequence: ledgerMetrics.currentSequence,
      latestLedgerClosedAt,
      tps: ledgerMetrics.tps,
      avgLedgerCloseSeconds: ledgerMetrics.avgCloseTimeSeconds,
      protocolVersion,
      timestamp: new Date().toISOString(),
    };
  }

  public setNetwork(network: 'mainnet' | 'testnet' | 'futurenet'): void {
    this.horizonClient.setNetwork(network);
    this.sorobanClient.setNetwork(network);
  }
}
