/**
 * Nolyvatix Data Engine - SorobanClient Unit Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SorobanClient } from '../clients/sorobanClient.js';

describe('SorobanClient', () => {
  test('should initialize with default configuration', () => {
    const client = new SorobanClient({ network: 'mainnet' });
    assert.strictEqual(client.getNetwork(), 'mainnet');
  });

  test('should switch network configuration', () => {
    const client = new SorobanClient({ network: 'mainnet' });
    client.setNetwork('testnet');
    assert.strictEqual(client.getNetwork(), 'testnet');
  });
});
