/**
 * Tests for Supabase client initialization
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

import { supabase } from '../shared/api/supabase';
import {
  supabaseAuthStorage,
  getStorage,
  setSyncStorage,
} from '../shared/lib/storage';

describe('Supabase client', () => {
  beforeAll(async () => {
    const storage = await getStorage();
    setSyncStorage(storage);
  });

  it('exports a supabase client instance', () => {
    expect(supabase).toBeDefined();
  });

  it('has auth.getSession method', () => {
    expect(typeof supabase.auth.getSession).toBe('function');
  });

  it('has auth.signInWithPassword method', () => {
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
  });

  it('has auth.signOut method', () => {
    expect(typeof supabase.auth.signOut).toBe('function');
  });

  it('has auth.onAuthStateChange method', () => {
    expect(typeof supabase.auth.onAuthStateChange).toBe('function');
  });

  it('has auth.signInWithOAuth method', () => {
    expect(typeof supabase.auth.signInWithOAuth).toBe('function');
  });
});

describe('supabaseAuthStorage (Supabase contract)', () => {
  beforeAll(async () => {
    const storage = await getStorage();
    setSyncStorage(storage);
  });

  beforeEach(() => { mockStore.clear(); });

  it('stores and retrieves session JSON', () => {
    const session = JSON.stringify({ access_token: 'abc', refresh_token: 'def' });
    supabaseAuthStorage.setItem('sb-session', session);
    expect(supabaseAuthStorage.getItem('sb-session')).toBe(session);
  });

  it('remove clears the stored session', () => {
    supabaseAuthStorage.setItem('sb-session', '{"token":"x"}');
    supabaseAuthStorage.removeItem('sb-session');
    expect(supabaseAuthStorage.getItem('sb-session')).toBeNull();
  });

  it('returns null for non-existent key', () => {
    expect(supabaseAuthStorage.getItem('does-not-exist')).toBeNull();
  });
});
