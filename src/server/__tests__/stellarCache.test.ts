/**
 * Nolyvatix Data Engine - StellarCache Unit Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { StellarCache } from '../cache/stellarCache.js';

describe('StellarCache', () => {
  test('should store, retrieve, and track hit/miss metrics', () => {
    const cache = new StellarCache(10, 100);
    cache.set('item1', { data: 123 });

    const retrieved = cache.get<{ data: number }>('item1');
    assert.deepStrictEqual(retrieved, { data: 123 });

    const missing = cache.get<string>('missing_key');
    assert.strictEqual(missing, null);

    const metrics = cache.getMetrics();
    assert.strictEqual(metrics.hits, 1);
    assert.strictEqual(metrics.misses, 1);
    assert.strictEqual(metrics.totalRequests, 2);
    assert.strictEqual(metrics.hitRatio, 50);
  });

  test('should invalidate keys by pattern', () => {
    const cache = new StellarCache(10, 100);
    cache.set('account_123', 'A');
    cache.set('account_456', 'B');
    cache.set('tx_789', 'C');

    const deleted = cache.invalidatePattern(/^account_/);
    assert.strictEqual(deleted, 2);
    assert.strictEqual(cache.has('account_123'), false);
    assert.strictEqual(cache.has('account_456'), false);
    assert.strictEqual(cache.has('tx_789'), true);
  });

  test('should correctly purge expired items', async () => {
    const cache = new StellarCache(0.02, 100);
    cache.set('fast_expire', 'val', 0.02);

    await new Promise((resolve) => setTimeout(resolve, 35));
    const result = cache.get('fast_expire');
    assert.strictEqual(result, null);
  });
});
