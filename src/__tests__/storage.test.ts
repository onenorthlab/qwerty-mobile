/**
 * Tests for MMKV storage adapters
 * (supabaseAuthStorage, zustandStorage)
 */

// Variable must be prefixed with 'mock' to be accessible inside jest.mock() factory
const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn((key: string) => mockStore.get(key) ?? null),
    set: jest.fn((key: string, value: string) => { mockStore.set(key, value); }),
    remove: jest.fn((key: string) => { mockStore.delete(key); }),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('test-encryption-key'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('12345678-1234-1234-1234-123456789abc'),
}));

import {
  supabaseAuthStorage,
  zustandStorage,
  setSyncStorage,
  getStorage,
} from '../shared/lib/storage';

describe('Storage module init', () => {
  beforeAll(async () => {
    const storage = await getStorage();
    setSyncStorage(storage);
  });

  it('getStorage returns same instance on multiple calls (singleton)', async () => {
    const a = await getStorage();
    const b = await getStorage();
    expect(a).toBe(b);
  });
});

describe('supabaseAuthStorage', () => {
  beforeAll(async () => {
    const storage = await getStorage();
    setSyncStorage(storage);
  });

  beforeEach(() => { mockStore.clear(); });

  it('setItem and getItem round-trip', () => {
    supabaseAuthStorage.setItem('auth-token', 'tok_abc123');
    expect(supabaseAuthStorage.getItem('auth-token')).toBe('tok_abc123');
  });

  it('removeItem deletes the key', () => {
    supabaseAuthStorage.setItem('to-remove', 'value');
    supabaseAuthStorage.removeItem('to-remove');
    expect(supabaseAuthStorage.getItem('to-remove')).toBeNull();
  });

  it('getItem returns null for missing key', () => {
    expect(supabaseAuthStorage.getItem('nonexistent-key')).toBeNull();
  });

  it('overwrites existing value on setItem', () => {
    supabaseAuthStorage.setItem('key', 'first');
    supabaseAuthStorage.setItem('key', 'second');
    expect(supabaseAuthStorage.getItem('key')).toBe('second');
  });
});

describe('zustandStorage', () => {
  beforeAll(async () => {
    const storage = await getStorage();
    setSyncStorage(storage);
  });

  beforeEach(() => { mockStore.clear(); });

  it('setItem and getItem round-trip', () => {
    zustandStorage.setItem('zustand-test', JSON.stringify({ theme: 'dark' }));
    const raw = zustandStorage.getItem('zustand-test');
    expect(JSON.parse(raw!)).toEqual({ theme: 'dark' });
  });

  it('removeItem deletes the key', () => {
    zustandStorage.setItem('zust-remove', 'val');
    zustandStorage.removeItem('zust-remove');
    expect(zustandStorage.getItem('zust-remove')).toBeNull();
  });

  it('handles JSON-serializable objects', () => {
    const data = { theme: 'system', language: 'zh', notificationsEnabled: false };
    zustandStorage.setItem('settings', JSON.stringify(data));
    expect(JSON.parse(zustandStorage.getItem('settings')!)).toEqual(data);
  });
});
