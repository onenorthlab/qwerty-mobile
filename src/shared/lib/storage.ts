/**
 * Secure Storage Layer
 *
 * Strategy (2026 best practice):
 *   - MMKV  — fast encrypted key-value store (stores auth tokens + app data)
 *   - SecureStore — iOS Keychain / Android Keystore (stores the MMKV encryption key)
 *
 * Why not AsyncStorage directly?
 *   - AsyncStorage has no encryption
 *   - SecureStore alone has a 2048-byte limit (too small for JWT tokens)
 *   - MMKV + SecureStore gives us fast + encrypted + unlimited size
 */
import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY_ALIAS = 'onern-mmkv-key';

let _storage: MMKV | null = null;

async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(ENCRYPTION_KEY_ALIAS);
  if (existing) return existing;

  const key = Crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  await SecureStore.setItemAsync(ENCRYPTION_KEY_ALIAS, key);
  return key;
}

/**
 * Returns (and caches) the encrypted MMKV instance.
 * Must be called after the app is mounted (async).
 */
export async function getStorage(): Promise<MMKV> {
  if (_storage) return _storage;

  const encryptionKey = await getOrCreateEncryptionKey();
  const storage = createMMKV({ id: 'app-storage', encryptionKey });
  _storage = storage;
  return storage;
}

// ─── Sync storage reference (set after async init) ──────────────────────────
let _syncStorage: MMKV | null = null;

export function setSyncStorage(storage: MMKV): void {
  _syncStorage = storage;
}

// ─── Supabase Auth Storage Adapter ──────────────────────────────────────────
export const supabaseAuthStorage = {
  getItem(key: string): string | null {
    return _syncStorage?.getString(key) ?? null;
  },
  setItem(key: string, value: string): void {
    _syncStorage?.set(key, value);
  },
  removeItem(key: string): void {
    _syncStorage?.remove(key);
  },
};

// ─── Zustand Persistence Adapter ─────────────────────────────────────────────
export const zustandStorage = {
  getItem(key: string): string | null {
    return _syncStorage?.getString(key) ?? null;
  },
  setItem(key: string, value: string): void {
    _syncStorage?.set(key, value);
  },
  removeItem(key: string): void {
    _syncStorage?.remove(key);
  },
};
