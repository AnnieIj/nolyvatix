/**
 * Nolyvatix Data Engine - HorizonClient Unit Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { HorizonClient } from '../clients/horizonClient.js';

describe('HorizonClient', () => {
  test('should initialize with default mainnet configuration', () => {
    const client = new HorizonClient({ network: 'mainnet' });
    assert.strictEqual(client.getNetwork(), 'mainnet');
  });

  test('should switch networks correctly', () => {
    const client = new HorizonClient({ network: 'mainnet' });
    client.setNetwork('testnet');
    assert.strictEqual(client.getNetwork(), 'testnet');
  });

  test('should build pagination params properly', () => {
    const client = new HorizonClient();
    const params = client.buildPaginationParams({ cursor: '100', limit: 50, order: 'asc' });

    assert.strictEqual(params.cursor, '100');
    assert.strictEqual(params.limit, 50);
    assert.strictEqual(params.order, 'asc');
  });

  test('should clamp limit to max 200', () => {
    const client = new HorizonClient();
    const params = client.buildPaginationParams({ limit: 500 });
    assert.strictEqual(params.limit, 200);
  });
});
