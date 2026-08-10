/**
 * Nolyvatix Data Engine - Stellar Horizon REST API Client
 */

import { HorizonConfig, NetworkType, PaginationParams } from '../types/stellar.js';
import { HorizonApiError, NotFoundError, RateLimitError } from '../utils/errors.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('HorizonClient');

const NETWORK_ENDPOINTS: Record<NetworkType, string> = {
  mainnet: 'https://horizon.stellar.org',
  testnet: 'https://horizon-testnet.stellar.org',
  futurenet: 'https://horizon-futurenet.stellar.org',
};

export class HorizonClient {
  private config: HorizonConfig;

  constructor(config?: Partial<HorizonConfig>) {
    const network = config?.network || (process.env.VITE_STELLAR_NETWORK as NetworkType) || 'mainnet';
    const baseUrl = config?.baseUrl || process.env.VITE_HORIZON_URL || NETWORK_ENDPOINTS[network] || NETWORK_ENDPOINTS.mainnet;

    this.config = {
      network,
      baseUrl: baseUrl.replace(/\/$/, ''),
      timeoutMs: config?.timeoutMs || 10000,
      maxRetries: config?.maxRetries || 3,
      rateLimitPerMin: config?.rateLimitPerMin || 360,
    };

    logger.info(`Initialized HorizonClient for network: ${this.config.network} (${this.config.baseUrl})`);
  }

  public getNetwork(): NetworkType {
    return this.config.network;
  }

  public setNetwork(network: NetworkType, customUrl?: string): void {
    this.config.network = network;
    this.config.baseUrl = (customUrl || NETWORK_ENDPOINTS[network] || NETWORK_ENDPOINTS.mainnet).replace(/\/$/, '');
    logger.info(`Updated HorizonClient network to: ${this.config.network} (${this.config.baseUrl})`);
  }

  /**
   * Core HTTP request handler with automatic retry, timeout, rate limit handling, and pagination mapping.
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

    while (attempt <= this.config.maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NolyvatixDataEngine/1.0.0',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return (await response.json()) as T;
        }

        const statusCode = response.status;
        let responseBody: unknown = null;
        try {
          responseBody = await response.json();
        } catch {
          responseBody = await response.text();
        }

        if (statusCode === 404) {
          throw new NotFoundError(`Horizon Resource '${path}'`);
        }

        if (statusCode === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const resetTimeSec = retryAfter ? parseInt(retryAfter, 10) : 5;

          logger.warn(`Horizon 429 Rate Limit encountered. Retrying after ${resetTimeSec}s... (Attempt ${attempt}/${this.config.maxRetries})`);

          if (attempt <= this.config.maxRetries) {
            await this.sleep(resetTimeSec * 1000);
            continue;
          }
          throw new RateLimitError('Stellar Horizon REST API rate limit reached', resetTimeSec);
        }

        if (statusCode >= 500 && attempt <= this.config.maxRetries) {
          logger.warn(`Horizon 5xx Server Error (${statusCode}). Retrying in ${delayMs}ms... (Attempt ${attempt}/${this.config.maxRetries})`);
          await this.sleep(delayMs);
          delayMs *= 2;
          continue;
        }

        throw new HorizonApiError(
          `HTTP ${statusCode} on ${path}`,
          statusCode,
          responseBody
        );
      } catch (err) {
        if (err instanceof NotFoundError || err instanceof RateLimitError || err instanceof HorizonApiError) {
          throw err;
        }

        if (err instanceof Error && err.name === 'AbortError') {
          if (attempt <= this.config.maxRetries) {
            logger.warn(`Request timeout after ${this.config.timeoutMs}ms. Retrying... (Attempt ${attempt}/${this.config.maxRetries})`);
            await this.sleep(delayMs);
            delayMs *= 2;
            continue;
          }
          throw new HorizonApiError(`Request timed out after ${this.config.timeoutMs}ms`, 504);
        }

        if (attempt <= this.config.maxRetries) {
          logger.warn(`Network error on Horizon fetch: ${err instanceof Error ? err.message : String(err)}. Retrying...`);
          await this.sleep(delayMs);
          delayMs *= 2;
          continue;
        }

        throw new HorizonApiError(`Failed to communicate with Horizon: ${err instanceof Error ? err.message : String(err)}`, 502);
      }
    }

    throw new HorizonApiError('Maximum request retries exceeded', 502);
  }

  public buildPaginationParams(params?: PaginationParams): Record<string, unknown> {
    return {
      cursor: params?.cursor,
      order: params?.order || 'desc',
      limit: Math.min(Math.max(params?.limit || 20, 1), 200),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const defaultHorizonClient = new HorizonClient();
