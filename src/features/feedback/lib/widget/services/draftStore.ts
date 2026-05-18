export interface DraftStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface DraftValue {
  description: string;
  email: string;
}

interface DraftRecord {
  v: 1;
  description: string;
  email: string;
  saved_at: number;
}

export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const DRAFT_DEBOUNCE_MS = 500;
const KEY_PREFIX = '@feedbackbridge/draft/';

export function buildDraftKey(appId: string): string {
  return KEY_PREFIX + appId;
}

export async function loadDraft(
  storage: DraftStorage,
  appId: string,
  ttlMs: number = DRAFT_TTL_MS,
  now: () => number = Date.now,
): Promise<DraftValue | null> {
  try {
    const raw = await storage.getItem(buildDraftKey(appId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftRecord;
    if (!parsed || typeof parsed.saved_at !== 'number') return null;
    if (now() - parsed.saved_at >= ttlMs) {
      await storage.removeItem(buildDraftKey(appId)).catch(() => {});
      return null;
    }
    return {
      description: parsed.description ?? '',
      email: parsed.email ?? '',
    };
  } catch {
    return null;
  }
}

export async function saveDraft(
  storage: DraftStorage,
  appId: string,
  value: DraftValue,
  now: () => number = Date.now,
): Promise<void> {
  const record: DraftRecord = {
    v: 1,
    description: value.description,
    email: value.email,
    saved_at: now(),
  };
  await storage.setItem(buildDraftKey(appId), JSON.stringify(record)).catch(() => {});
}

export async function clearDraft(storage: DraftStorage, appId: string): Promise<void> {
  await storage.removeItem(buildDraftKey(appId)).catch(() => {});
}
