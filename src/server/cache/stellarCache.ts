/**
 * Nolyvatix Data Engine - Stellar Multi-Tier TTL & Metrics Cache
 * Provides high-performance in-memory caching with Redis-readiness,
 * detailed hit/miss telemetry, pattern eviction, and memory estimation.
 */

import { Logger } from '../utils/logger.js';

const logger = new Logger('StellarCache');

export interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRatio: number; // 0 to 100%
  keysCount: number;
  evictions: number;
  estimatedMemoryBytes: number;
  uptimeSeconds: number;
}

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  sizeBytes: number;
  hits: number;
}

export class StellarCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtlMs: number;
  private maxEntries: number;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;
  private startTime: number = Date.now();

  constructor(defaultTtlSeconds: number = 30, maxEntries: number = 2000) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
    this.maxEntries = maxEntries;

    // Periodic sweep for expired items every 15 seconds
    if (typeof setInterval !== 'undefined') {
      const timer = setInterval(() => this.purgeExpired(), 15000);
      if (timer.unref) timer.unref();
    }
  }

  private estimateSize(value: unknown): number {
    try {
      const str = JSON.stringify(value);
      return str ? str.length * 2 : 64;
    } catch {
      return 64;
    }
  }

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      this.evictions++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds?: number): void {
    // Evict oldest if exceeding max entries
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) {
        this.store.delete(firstKey);
        this.evictions++;
      }
    }

    const ttlMs = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtlMs;
    const now = Date.now();
    const sizeBytes = this.estimateSize(value);

    this.store.set(key, {
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
      sizeBytes,
      hits: 0,
    });
  }

  public async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFn();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  public has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public invalidatePattern(pattern: RegExp | string): number {
    let deletedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    logger.debug(`Invalidated ${deletedCount} cache entries for pattern: ${pattern}`);
    return deletedCount;
  }

  public purgeExpired(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        purged++;
        this.evictions++;
      }
    }
    return purged;
  }

  public clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  public size(): number {
    return this.store.size;
  }

  public getMetrics(): CacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? parseFloat(((this.hits / totalRequests) * 100).toFixed(2)) : 100;
    let estimatedMemoryBytes = 0;

    for (const entry of this.store.values()) {
      estimatedMemoryBytes += entry.sizeBytes;
    }

    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests,
      hitRatio,
      keysCount: this.store.size,
      evictions: this.evictions,
      estimatedMemoryBytes,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}

export const globalStellarCache = new StellarCache(30, 3000);
