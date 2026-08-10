import { SorobanContract, SorobanEvent } from '../../types';

const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-rpc.mainnet.stellar.org';

/**
 * Soroban Smart Contract RPC Service
 */
export class SorobanService {
  private rpcUrl: string;

  constructor(rpcUrl = SOROBAN_RPC_URL) {
    this.rpcUrl = rpcUrl;
  }

  /**
   * Fetch monitored Soroban Smart Contracts
   */
  async getContracts(): Promise<SorobanContract[]> {
    return [
      {
        contractId: 'CCW67TSB3SRE4XT2GDF3E7B8KLL9201938475610293847561029',
        name: 'Blend Capital Liquidity Pool',
        creatorAccount: 'GAAXK902837465102938475610293847561029384756',
        createdAtLedger: 51200192,
        invocations24h: 18420,
        successRate: 99.6,
        avgGasCpu: 1420500,
        avgGasMem: 84210,
        status: 'active',
        recentEventsCount: 3410,
      },
      {
        contractId: 'CD3810293847561029384756102938475610293847561029384',
        name: 'Phoenix DEX Automated Market Maker',
        creatorAccount: 'GBVCXZ9028374651029384756102938475610293847',
        createdAtLedger: 50820100,
        invocations24h: 31200,
        successRate: 98.9,
        avgGasCpu: 2180000,
        avgGasMem: 112000,
        status: 'active',
        recentEventsCount: 5290,
      },
      {
        contractId: 'CA992837465102938475610293847561029384756102938475',
        name: 'YieldBox Vault Router',
        creatorAccount: 'GDPLM0987654321098765432109876543210987654',
        createdAtLedger: 52100000,
        invocations24h: 8900,
        successRate: 99.8,
        avgGasCpu: 950000,
        avgGasMem: 45000,
        status: 'active',
        recentEventsCount: 1200,
      },
      {
        contractId: 'CB1122334455667788990011223344556677889900112233445',
        name: 'Stellar NFT Marketplace Core',
        creatorAccount: 'GCMN90182736450192837465019283746501928374',
        createdAtLedger: 49500000,
        invocations24h: 4200,
        successRate: 97.2,
        avgGasCpu: 3100000,
        avgGasMem: 180000,
        status: 'active',
        recentEventsCount: 890,
      },
    ];
  }

  /**
   * Fetch recent WASM Contract Events
   */
  async getContractEvents(contractId?: string, limit = 10): Promise<SorobanEvent[]> {
    const now = Date.now();
    const mockTopics = ['swap', 'deposit', 'withdraw', 'transfer_event', 'mint'];

    return Array.from({ length: limit }).map((_, i) => ({
      id: `evt-${i}-${now}`,
      contractId: contractId || 'CCW67TSB3SRE4XT2GDF3E7B8KLL9201938475610293847561029',
      txHash: `f8a9102938475610293847561029384756102938475610293847561029384756${i}`,
      ledgerSequence: 52918402 - i,
      createdAt: new Date(now - i * 8000).toISOString(),
      topic: ['fn_call', mockTopics[i % mockTopics.length]],
      valueJson: {
        amount_in: '1500.0000000',
        amount_out: '1498.2500000',
        sender: 'GAAXK902837465102938475610293847561029384756',
        slippage_bps: 12,
      },
      type: 'contract',
    }));
  }
}

export const sorobanService = new SorobanService();
