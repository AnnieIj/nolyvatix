import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // 5 seconds stale time for real-time ledger sync
      gcTime: 10 * 60 * 1000, // 10 minutes cache cleanup
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
