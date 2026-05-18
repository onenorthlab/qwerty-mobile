/**
 * Tests for TanStack Query client configuration
 */

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn((key: string) => mockStore.get(key) ?? null),
    set: jest.fn((key: string, value: string) => { mockStore.set(key, value); }),
    remove: jest.fn((key: string) => { mockStore.delete(key); }),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('test-key'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('12345678-1234-1234-1234-123456789abc'),
}));

import { queryClient, queryPersister } from '../shared/lib/queryClient';

describe('queryClient configuration', () => {
  it('is a QueryClient instance', () => {
    expect(queryClient).toBeDefined();
    expect(typeof queryClient.getQueryData).toBe('function');
    expect(typeof queryClient.invalidateQueries).toBe('function');
  });

  it('staleTime is 5 minutes', () => {
    const opts = queryClient.getDefaultOptions();
    expect(opts.queries?.staleTime).toBe(5 * 60 * 1000);
  });

  it('gcTime is 30 minutes', () => {
    const opts = queryClient.getDefaultOptions();
    expect(opts.queries?.gcTime).toBe(30 * 60 * 1000);
  });

  it('retry is 2 for queries', () => {
    const opts = queryClient.getDefaultOptions();
    expect(opts.queries?.retry).toBe(2);
  });

  it('retry is 0 for mutations (no auto-retry)', () => {
    const opts = queryClient.getDefaultOptions();
    expect(opts.mutations?.retry).toBe(0);
  });

  it('refetchOnWindowFocus is disabled (not applicable in RN)', () => {
    const opts = queryClient.getDefaultOptions();
    expect(opts.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('refetchOnReconnect is enabled', () => {
    const opts = queryClient.getDefaultOptions();
    expect(opts.queries?.refetchOnReconnect).toBe(true);
  });
});

describe('queryPersister', () => {
  it('is defined', () => {
    expect(queryPersister).toBeDefined();
  });
});
