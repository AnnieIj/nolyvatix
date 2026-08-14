/**
 * Nolyvatix Data Engine - Stellar Horizon Production Client
 * Supports high-throughput Horizon querying, automatic retries with exponential backoff & jitter,
 * rate limit throttle queues, latency tracking, network switching, and health diagnostics.
 */

import { HorizonConfig, NetworkType } from '../../types/stellar.js';
import { HorizonApiError, NotFoundError, RateLimitError } from '../../utils/errors.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('StellarHorizonClient');

export const HORIZON_NETWORKS: Record<NetworkType, string> = {
  mainnet: 'https://horizon.stellar.org',
  testnet: 'https://horizon-testnet.stellar.org',
  futurenet: 'https://horizon-futurenet.stellar.org',
};

export interface HorizonClientHealthStats {
  status: 'healthy' | 'degraded' | 'down';
  network: NetworkType;
  endpoint: string;
  latencyMs: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number; // percentage
  lastSuccessfulPing: string | null;
  consecutiveErrors: number;
}

export class StellarHorizonClient {
  private config: HorizonConfig;
  private totalRequests: number = 0;
  private successfulRequests: number = 0;
  private failedRequests: number = 0;
  private lastLatencyMs: number = 0;
  private lastSuccessfulPing: string | null = null;
  private consecutiveErrors: number = 0;

  constructor(config?: Partial<HorizonConfig>) {
    const network = config?.network || (process.env.VITE_STELLAR_NETWORK as NetworkType) || 'mainnet';
    const baseUrl = config?.baseUrl || process.env.VITE_HORIZON_URL || HORIZON_NETWORKS[network] || HORIZON_NETWORKS.mainnet;

    this.config = {
      network,
      baseUrl: baseUrl.replace(/\/$/, ''),
      timeoutMs: config?.timeoutMs || 12000,
      maxRetries: config?.maxRetries || 3,
      rateLimitPerMin: config?.rateLimitPerMin || 360,
    };

    logger.info(`Stellar Horizon Client initialized for [${this.config.network}] -> ${this.config.baseUrl}`);
  }

  public getNetwork(): NetworkType {
    return this.config.network;
  }

  public getBaseUrl(): string {
    return this.config.baseUrl;
  }

  public setNetwork(network: NetworkType, customUrl?: string): void {
    this.config.network = network;
    this.config.baseUrl = (customUrl || HORIZON_NETWORKS[network] || HORIZON_NETWORKS.mainnet).replace(/\/$/, '');
    this.consecutiveErrors = 0;
    logger.info(`Horizon client network switched to: ${this.config.network} (${this.config.baseUrl})`);
  }

  /**
   * Resilient HTTP request with retry queue, backoff, and latency tracking.
   */
  public async request<T>(path: string, queryParams: Record<string, unknown> = {}): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);

    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });

    let attempt = 0;
    let delayMs = 300;
    const startTime = Date.now();
    this.totalRequests++;

    while (attempt <= this.config.maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NolyvatixStellarDataLayer/2.0.0',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        this.lastLatencyMs = latency;

        if (response.ok) {
          this.successfulRequests++;
          this.consecutiveErrors = 0;
          this.lastSuccessfulPing = new Date().toISOString();
          return (await response.json()) as T;
        }

        const statusCode = response.status;
        let responseBody: any = null;
        try {
          responseBody = await response.json();
        } catch {
          responseBody = await response.text();
        }

        if (statusCode === 404) {
          this.successfulRequests++;
          this.consecutiveErrors = 0;
          throw new NotFoundError(`Stellar Resource '${path}'`);
        }

        if (statusCode === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const resetTimeSec = retryAfter ? parseInt(retryAfter, 10) : 3;

          logger.warn(`Horizon 429 Rate Limited. Backing off for ${resetTimeSec}s (Attempt ${attempt}/${this.config.maxRetries})`);

          if (attempt <= this.config.maxRetries) {
            await this.sleep(resetTimeSec * 1000 + Math.random() * 200);
            continue;
          }
          throw new RateLimitError(`Stellar Horizon Rate limit exceeded (429)`);
        }

        if (statusCode >= 500 && attempt <= this.config.maxRetries) {
          logger.warn(`Horizon 5xx Server Error (${statusCode}). Retrying in ${delayMs}ms...`);
          await this.sleep(delayMs + Math.random() * 150);
          delayMs *= 2;
          continue;
        }

        this.recordFailure();
        throw new HorizonApiError(
          responseBody?.title || responseBody?.detail || `Horizon request failed (${statusCode})`,
          statusCode,
          responseBody
        );
      } catch (err: any) {
        if (err instanceof NotFoundError || err instanceof RateLimitError || err instanceof HorizonApiError) {
          throw err;
        }

        if (attempt <= this.config.maxRetries) {
          logger.warn(`Horizon network timeout or fetch error. Retrying attempt ${attempt}...`, { error: err.message });
          await this.sleep(delayMs + Math.random() * 100);
          delayMs *= 2;
        } else {
          this.recordFailure();
          throw new HorizonApiError(`Failed to connect to Stellar Horizon node (${this.config.baseUrl}): ${err.message}`, 503);
        }
      }
    }

    this.recordFailure();
    throw new HorizonApiError(`Exceeded maximum retry attempts for Horizon request: ${path}`, 504);
  }

  private recordFailure(): void {
    this.failedRequests++;
    this.consecutiveErrors++;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getHealthStats(): HorizonClientHealthStats {
    const errorRate = this.totalRequests > 0 ? parseFloat(((this.failedRequests / this.totalRequests) * 100).toFixed(2)) : 0;
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';

    if (this.consecutiveErrors >= 4) {
      status = 'down';
    } else if (this.consecutiveErrors > 0 || errorRate > 15) {
      status = 'degraded';
    }

    return {
      status,
      network: this.config.network,
      endpoint: this.config.baseUrl,
      latencyMs: this.lastLatencyMs,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      errorRate,
      lastSuccessfulPing: this.lastSuccessfulPing,
      consecutiveErrors: this.consecutiveErrors,
    };
  }
}

export const defaultStellarHorizonClient = new StellarHorizonClient();
