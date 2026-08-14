import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { AppLayout } from './components/layout/AppLayout';
import { AppRouter } from './router/AppRouter';
import { useStellarStream } from './hooks/useStellarStream';

function AppContent() {
  // Activate live real-time Server-Sent Events (SSE) stream
  useStellarStream({ topics: ['all'], enabled: true });

  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
