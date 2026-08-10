/**
 * Nolyvatix Data Engine - Services & Repositories Unit Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LedgerRepository, HorizonLedgerRaw } from '../repositories/ledgerRepository.js';
import { TransactionRepository, HorizonTransactionRaw } from '../repositories/transactionRepository.js';
import { HorizonClient } from '../clients/horizonClient.js';
import { MemoryCache } from '../cache/memoryCache.js';

describe('LedgerRepository Mappings', () => {
  test('should accurately map raw Horizon ledger to StellarLedger domain object', () => {
    const horizonClient = new HorizonClient({ network: 'mainnet' });
    const cache = new MemoryCache();
    const repo = new LedgerRepository(horizonClient, cache);

    const mockRaw: HorizonLedgerRaw = {
      id: 'mock_ledger_id',
      sequence: 1234567,
      hash: 'mock_hash_123',
      prev_hash: 'mock_prev_hash_000',
      transaction_count: 42,
      successful_transaction_count: 40,
      failed_transaction_count: 2,
      operation_count: 100,
      tx_set_operation_count: 100,
      closed_at: '2026-08-10T12:00:00Z',
      total_coins: '100000000',
      fee_pool: '5000',
      base_fee_in_stroops: 100,
      base_reserve_in_stroops: 5000000,
      max_tx_set_size: 1000,
      protocol_version: 21,
      header_xdr: 'AAAAAQ==',
    };

    const mapped = repo.mapRawLedger(mockRaw);

    assert.strictEqual(mapped.sequence, 1234567);
    assert.strictEqual(mapped.hash, 'mock_hash_123');
    assert.strictEqual(mapped.transactionCount, 42);
    assert.strictEqual(mapped.successfulTransactionCount, 40);
    assert.strictEqual(mapped.failedTransactionCount, 2);
    assert.strictEqual(mapped.baseFee, 100);
    assert.strictEqual(mapped.protocolVersion, 21);
  });
});

describe('TransactionRepository Mappings', () => {
  test('should map raw Horizon transaction correctly', () => {
    const horizonClient = new HorizonClient({ network: 'mainnet' });
    const cache = new MemoryCache();
    const repo = new TransactionRepository(horizonClient, cache);

    const mockRaw: HorizonTransactionRaw = {
      id: 'tx_123',
      hash: '0xhash1234567890abcdef',
      ledger: 100,
      created_at: '2026-08-10T12:00:00Z',
      source_account: 'GBRPYHIL2CI3FNQ4BXLFMNDLFNOA3S3M3O336IEL3E2CYOQL3I6O4M2X',
      source_account_sequence: '1000',
      fee_charged: 100,
      max_fee: 1000,
      operation_count: 1,
      signatures: ['sig1'],
      successful: true,
      result_xdr: 'AAAAAQ==',
      envelope_xdr: 'AAAAAQ==',
    };

    const mapped = repo.mapRawTransaction(mockRaw);

    assert.strictEqual(mapped.hash, '0xhash1234567890abcdef');
    assert.strictEqual(mapped.ledgerSequence, 100);
    assert.strictEqual(mapped.successful, true);
    assert.strictEqual(mapped.feeCharged, 100);
  });
});
