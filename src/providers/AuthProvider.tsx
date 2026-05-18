/**
 * AuthProvider — Supabase auth state management.
 *
 * Apple Sign-In strategy:
 *   - iOS: native Apple Authentication → signInWithIdToken (no browser)
 *   - Android: OAuth browser flow via expo-web-browser (fallback)
 *
 * Reference: formless (iOS native), vibefast (OAuth browser fallback)
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Platform } from 'react-native';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../shared/api/supabase';
import { completeAuthFromUrl } from '../shared/lib/auth-callback';

/** App scheme — must match app.config.ts `scheme` field */
const REDIRECT_URI = Linking.createURL('auth/callback');

void WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthProcessing: boolean;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  // 1. Load existing session + subscribe to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('[Auth] initial session loaded', { hasSession: !!data.session });
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[Auth] onAuthStateChange', { event, hasSession: !!newSession });
        setSession(newSession);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // 2. Deep link handler — for OAuth callbacks (email confirmation, OAuth redirect)
  useEffect(() => {
    const isPotentialAuthCallback = (url: string) =>
      url.includes('auth/callback') ||
      url.includes('access_token=') ||
      url.includes('refresh_token=') ||
      url.includes('code=');

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('[Auth] deep link received', url);
      if (!isPotentialAuthCallback(url) && !url.includes('expo-development-client')) {
        return;
      }

      setIsAuthProcessing(true);
      const ok = await completeAuthFromUrl(url);
      if (ok) {
        console.log('[Auth] deep link handled', { ok });
      }
      setTimeout(() => setIsAuthProcessing(false), 250);
    };

    // Handle initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) void handleDeepLink({ url });
    });

    // Listen for subsequent deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  // ─── Apple Sign-In ───────────────────────────────────────────────────────

  const signInWithApple = useCallback(async () => {
    if (Platform.OS === 'ios') {
      // iOS: native Apple Authentication → signInWithIdToken (no browser needed)
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple Sign-In: no identity token');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) throw error;

      // Apple only returns full name on FIRST sign-in — save to user metadata
      if (credential.fullName?.givenName) {
        await supabase.auth.updateUser({
          data: {
            full_name: [credential.fullName.givenName, credential.fullName.familyName]
              .filter(Boolean)
              .join(' '),
          },
        });
      }
    } else {
      setIsAuthProcessing(true);
      // Android: OAuth browser flow (Apple native is iOS-only)
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
        });
        if (error) throw error;
        if (!data.url) throw new Error('No OAuth URL returned');
        console.log('[Auth] starting Apple OAuth', { redirectTo: REDIRECT_URI, authUrl: data.url });

        const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
        console.log('[Auth] openAuthSessionAsync result', result);

        if (result.type === 'success' && result.url) {
          const ok = await completeAuthFromUrl(result.url);
          if (!ok) throw new Error('Failed to extract session from callback');
        }
      } finally {
        setTimeout(() => setIsAuthProcessing(false), 250);
      }
    }
  }, []);

  // ─── Email / Password ──────────────────────────────────────────────────

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: REDIRECT_URI },
      });
      return { error };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ─── Context value ──────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAuthProcessing,
      signInWithApple,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [
      session,
      isLoading,
      isAuthProcessing,
      signInWithApple,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
