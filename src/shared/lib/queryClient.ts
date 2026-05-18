/**
 * TanStack Query Client — configured for React Native.
 *
 * Key settings:
 *   staleTime  — 5 min: re-use cached data without refetching
 *   gcTime     — 30 min: keep inactive data in memory
 *   retry      — 2: automatic retry on network errors
 *   refetchOnWindowFocus — disabled (no "window" in React Native)
 */
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { zustandStorage } from './storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: false, // Not applicable in React Native
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * MMKV-backed persister for React Query.
 * Restores the query cache after app restart.
 */
export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => zustandStorage.getItem(key),
    setItem: async (key, value) => zustandStorage.setItem(key, value),
    removeItem: async (key) => zustandStorage.removeItem(key),
  },
  throttleTime: 1000,
});
