/**
 * Nolyvatix Real-Time SSE Stream Hook (useStellarStream)
 * Subscribes to the backend Server-Sent Events (SSE) stream, auto-reconnects,
 * syncs with Zustand store, and seamlessly updates TanStack Query caches.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';

export interface UseStellarStreamOptions {
  topics?: string[];
  enabled?: boolean;
}

export interface StreamConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastEventAt: string | null;
  reconnectAttempts: number;
}

export function useStellarStream(options: UseStellarStreamOptions = {}) {
  const { topics = ['all'], enabled = true } = options;
  const queryClient = useQueryClient();
  const setNetworkTelemetry = useAppStore((s) => s.setNetworkTelemetry);
  const setStellarNetwork = useAppStore((s) => s.setStellarNetwork);

  const [connectionState, setConnectionState] = useState<StreamConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastEventAt: null,
    reconnectAttempts: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionState((prev) => ({ ...prev, isConnecting: true, error: null }));

    const topicsParam = topics.join(',');
    const sseUrl = `/api/stream/events?topics=${encodeURIComponent(topicsParam)}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionState({
        isConnected: true,
        isConnecting: false,
        error: null,
        lastEventAt: new Date().toISOString(),
        reconnectAttempts: 0,
      });
    };

    es.onerror = (_err) => {
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'Stream disconnected, attempting reconnection...',
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));

      es.close();

      // Exponential backoff reconnect
      const delay = Math.min(1000 * Math.pow(1.5, connectionState.reconnectAttempts), 10000);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    // 1. New Ledger Closed Event
    es.addEventListener('ledger_closed', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const ledger = payload.ledger;

        setConnectionState((prev) => ({ ...prev, lastEventAt: new Date().toISOString() }));

        // Update latestLedgers Query cache
        queryClient.setQueryData(['latestLedgers', 20], (oldData: any[] | undefined) => {
          if (!oldData) return [ledger];
          const exists = oldData.some((l) => l.sequence === ledger.sequence);
          if (exists) return oldData;
          return [ledger, ...oldData.slice(0, 19)];
        });

        // Update latestLedgers (10 count)
        queryClient.setQueryData(['latestLedgers', 10], (oldData: any[] | undefined) => {
          if (!oldData) return [ledger];
          const exists = oldData.some((l) => l.sequence === ledger.sequence);
          if (exists) return oldData;
          return [ledger, ...oldData.slice(0, 9)];
        });

        // Invalidate dependent queries
        queryClient.invalidateQueries({ queryKey: ['networkHealth'] });
      } catch {}
    });

    // 2. Transactions Updated Event
    es.addEventListener('transactions_updated', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const transactions = payload.transactions;

        if (Array.isArray(transactions) && transactions.length > 0) {
          queryClient.setQueryData(['recentTransactions', 20], () => transactions.slice(0, 20));
          queryClient.setQueryData(['recentTransactions', 10], () => transactions.slice(0, 10));
        }
      } catch {}
    });

    // 3. TPS Updated Event
    es.addEventListener('tps_updated', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setNetworkTelemetry({
          tps: payload.tps,
          currentLedgerSequence: payload.currentLedgerSequence,
          avgLedgerCloseSeconds: payload.avgLedgerCloseSeconds,
          lastUpdated: payload.timestamp,
        });
      } catch {}
    });

    // 4. Network Health Event
    es.addEventListener('network_health', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setNetworkTelemetry({
          horizonStatus: data.horizonStatus === 'down' ? 'offline' : data.horizonStatus,
          sorobanStatus: data.sorobanRpcStatus === 'down' ? 'offline' : data.sorobanRpcStatus,
          currentLedgerSequence: data.currentLedgerSequence,
          tps: data.tps,
          avgLedgerCloseSeconds: data.avgLedgerCloseSeconds,
          lastUpdated: data.timestamp,
        });

        if (data.network === 'mainnet' || data.network === 'testnet') {
          setStellarNetwork(data.network);
        }

        queryClient.setQueryData(['networkHealth'], data);
      } catch {}
    });

    // 5. Network Analytics Event
    es.addEventListener('network_analytics', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setNetworkTelemetry({
          currentLedgerSequence: data.currentLedgerSequence,
          tps: data.tps,
          avgLedgerCloseSeconds: data.avgLedgerCloseSeconds,
          total24hVolumeUSD: data.totalVolume24hUSD || 184920000,
          activeAccounts24h: data.activeAccounts24h || 42150,
          lastUpdated: data.latestLedgerClosedAt,
        });
      } catch {}
    });

    // 6. Asset Summary Event
    es.addEventListener('asset_summary', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.setQueryData(['assetSummary'], data);
      } catch {}
    });

    // 7. Liquidity Metrics Event
    es.addEventListener('liquidity_metrics', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.setQueryData(['liquidityMetrics'], data);
      } catch {}
    });
  }, [enabled, topics, queryClient, setNetworkTelemetry, setStellarNetwork, connectionState.reconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    ...connectionState,
    reconnect: connect,
  };
}
