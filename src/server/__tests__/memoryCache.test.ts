/**
 * Nolyvatix Data Engine - MemoryCache Unit Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MemoryCache } from '../cache/memoryCache.js';

describe('MemoryCache', () => {
  test('should store and retrieve items', () => {
    const cache = new MemoryCache(10);
    cache.set('test_key', { foo: 'bar' });

    const result = cache.get<{ foo: string }>('test_key');
    assert.deepStrictEqual(result, { foo: 'bar' });
  });

  test('should return null for expired items', async () => {
    const cache = new MemoryCache(0.01); // 10ms
    cache.set('expire_key', 'value', 0.01);

    await new Promise((resolve) => setTimeout(resolve, 30));
    const result = cache.get<string>('expire_key');
    assert.strictEqual(result, null);
  });

  test('should fetch and store value using getOrFetch', async () => {
    const cache = new MemoryCache(10);
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      return 'fetched_value';
    };

    const val1 = await cache.getOrFetch('fetch_key', fetcher);
    assert.strictEqual(val1, 'fetched_value');
    assert.strictEqual(fetchCount, 1);

    const val2 = await cache.getOrFetch('fetch_key', fetcher);
    assert.strictEqual(val2, 'fetched_value');
    assert.strictEqual(fetchCount, 1); // Served from cache
  });
});
