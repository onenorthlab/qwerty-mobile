import { supabase } from '../api/supabase';

const CALLBACK_DEDUP_WINDOW_MS = 10_000;
const recentlyHandledCallbackKeys = new Map<string, number>();

function cleanupExpiredHandledKeys() {
  const now = Date.now();
  for (const [key, ts] of recentlyHandledCallbackKeys.entries()) {
    if (now - ts > CALLBACK_DEDUP_WINDOW_MS) {
      recentlyHandledCallbackKeys.delete(key);
    }
  }
}

function unwrapExpoDevClientUrl(input: string): string {
  let current = input;

  // Expo dev client may wrap deep links in: <scheme>://expo-development-client/?url=<encoded>
  for (let i = 0; i < 3; i += 1) {
    try {
      const parsed = new URL(current);
      const nested = parsed.searchParams.get('url');
      if (!nested) break;
      const decoded = decodeURIComponent(nested);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }

  return current;
}

/**
 * Complete Supabase OAuth callback from deep link URL.
 *
 * Supports both callback shapes:
 * 1) PKCE: `...?code=...` -> exchangeCodeForSession
 * 2) Implicit: `...#access_token=...&refresh_token=...` -> setSession
 */
export async function completeAuthFromUrl(url: string): Promise<boolean> {
  try {
    console.log('[AuthCallback] incoming url', url);
    const normalizedUrl = unwrapExpoDevClientUrl(url);
    if (normalizedUrl !== url) {
      console.log('[AuthCallback] normalized wrapped url', normalizedUrl);
    }

    const parsed = new URL(normalizedUrl);
    const looksLikeAuthCallback =
      normalizedUrl.includes('auth/callback') ||
      normalizedUrl.includes('code=') ||
      normalizedUrl.includes('access_token=');

    if (!looksLikeAuthCallback) {
      return false;
    }

    const dedupKey =
      parsed.searchParams.get('code') ||
      parsed.hash ||
      normalizedUrl;
    cleanupExpiredHandledKeys();
    if (recentlyHandledCallbackKeys.has(dedupKey)) {
      console.log('[AuthCallback] duplicated callback ignored');
      return true;
    }
    recentlyHandledCallbackKeys.set(dedupKey, Date.now());

    const code = parsed.searchParams.get('code');
    if (code) {
      console.log('[AuthCallback] detected PKCE code, exchanging for session');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[AuthCallback] exchangeCodeForSession failed', error.message);
      } else {
        console.log('[AuthCallback] exchangeCodeForSession succeeded');
      }
      return !error;
    }

    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      console.log('[AuthCallback] detected token hash, setting session');
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error('[AuthCallback] setSession failed', error.message);
      } else {
        console.log('[AuthCallback] setSession succeeded');
      }
      return !error;
    }

    console.warn('[AuthCallback] callback url found but no code or token');
    return false;
  } catch (error) {
    console.error('[AuthCallback] failed to parse callback URL', error);
    return false;
  }
}
