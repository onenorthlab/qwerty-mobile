/**
 * Device Install ID — stable unique identifier for this app installation.
 *
 * Persisted via SecureStore (survives app restarts).
 * Re-generated only on app uninstall + reinstall.
 */
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = 'onern-device-install-id';

let _cachedDeviceId: string | null = null;

export async function getDeviceInstallId(): Promise<string> {
  if (_cachedDeviceId) return _cachedDeviceId;

  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) {
    _cachedDeviceId = existing;
    return existing;
  }

  const newId = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  _cachedDeviceId = newId;
  return newId;
}
