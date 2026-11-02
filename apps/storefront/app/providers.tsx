'use client';

import { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreAppearance, StoreSettings } from '@/lib/types';

interface StoreContextValue {
  storeSlug: string;
  appearance: StoreAppearance | null;
  settings: StoreSettings | null;
}

const StoreCtx = createContext<StoreContextValue>({
  storeSlug: 'demo-store',
  appearance: null,
  settings: null,
});

export const useStore = () => useContext(StoreCtx);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export function Providers({
  children,
  storeSlug,
  appearance,
  settings,
}: {
  children: ReactNode;
  storeSlug: string;
  appearance: StoreAppearance | null;
  settings: StoreSettings | null;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreCtx.Provider value={{ storeSlug, appearance, settings }}>
        {children}
      </StoreCtx.Provider>
    </QueryClientProvider>
  );
}
