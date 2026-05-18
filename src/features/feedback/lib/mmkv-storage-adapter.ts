import { useMemo } from 'react';
import type { DraftStorageProp } from './widget';

/**
 * The widget expects an async getItem/setItem/removeItem trio. The starter's
 * MMKV instance is sync, so we wrap each call in Promise.resolve. We piggyback
 * on the same `_syncStorage` singleton that supabaseAuthStorage / zustandStorage
 * use (set in `app/_layout.tsx` after `getStorage()` resolves).
 *
 * We import the same module-level adapter instead of creating a fresh MMKV so
 * the encryption key and DB id stay consistent.
 */
import { zustandStorage } from '../../../shared/lib/storage';

const draftStorage: DraftStorageProp = {
  getItem: async (key) => zustandStorage.getItem(key),
  setItem: async (key, value) => {
    zustandStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    zustandStorage.removeItem(key);
  },
};

export function useFeedbackDraftStorage(): DraftStorageProp {
  return useMemo(() => draftStorage, []);
}
