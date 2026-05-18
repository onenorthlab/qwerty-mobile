import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type DraftStorage,
  type DraftValue,
  DRAFT_DEBOUNCE_MS,
  DRAFT_TTL_MS,
  clearDraft,
  loadDraft,
  saveDraft,
} from '../services/draftStore';

export type { DraftStorage, DraftValue };

export interface UseDraftOptions {
  storage: DraftStorage | null | undefined;
  appId: string;
  ttlMs?: number;
  debounceMs?: number;
  now?: () => number;
}

export interface UseDraftResult {
  value: DraftValue;
  setDescription: (s: string) => void;
  setEmail: (s: string) => void;
  /** Wipes the persisted draft. Call on successful submission. */
  clear: () => void;
  loading: boolean;
}

export function useDraft(opts: UseDraftOptions): UseDraftResult {
  const { storage, appId } = opts;
  const ttl = opts.ttlMs ?? DRAFT_TTL_MS;
  const debounce = opts.debounceMs ?? DRAFT_DEBOUNCE_MS;
  const now = opts.now ?? Date.now;

  const [value, setValue] = useState<DraftValue>({ description: '', email: '' });
  const [loading, setLoading] = useState<boolean>(Boolean(storage));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!storage) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadDraft(storage, appId, ttl, now).then((loaded) => {
      if (cancelled) return;
      if (loaded) setValue(loaded);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [storage, appId, ttl, now]);

  const scheduleSave = useCallback(
    (next: DraftValue) => {
      if (!storage) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        saveDraft(storage, appId, next, now);
      }, debounce);
    },
    [storage, appId, debounce, now],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const setDescription = useCallback(
    (s: string) => {
      setValue((v) => {
        const next = { ...v, description: s };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const setEmail = useCallback(
    (s: string) => {
      setValue((v) => {
        const next = { ...v, email: s };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setValue({ description: '', email: '' });
    if (storage) clearDraft(storage, appId);
  }, [storage, appId]);

  return { value, setDescription, setEmail, clear, loading };
}
