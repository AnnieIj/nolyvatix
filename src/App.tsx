import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { AppLayout } from './components/layout/AppLayout';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </QueryClientProvider>
  );
}
