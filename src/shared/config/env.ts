/**
 * Environment variables — validated at runtime with Zod.
 * All EXPO_PUBLIC_* vars are safe to expose in the client bundle.
 *
 * Usage:
 *   import { env } from '@/shared/config/env';
 *   console.log(env.SUPABASE_URL);
 */
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.url('EXPO_PUBLIC_SUPABASE_URL must be a valid URL').optional(),
  SUPABASE_ANON_KEY: z.string().min(1, 'EXPO_PUBLIC_SUPABASE_ANON_KEY is required').optional(),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  REVENUECAT_API_KEY_IOS: z.string().optional(),
  REVENUECAT_API_KEY_ANDROID: z.string().optional(),
  GOOGLE_WEB_CLIENT_ID: z.string().optional(),
  ONESIGNAL_APP_ID: z.string().optional(),
  FEEDBACK_RELAY_ENDPOINT: z.url('EXPO_PUBLIC_FEEDBACK_RELAY_ENDPOINT must be a valid URL').optional(),
  FEEDBACK_API_KEY: z.string().optional(),
  FEEDBACK_APP_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse({
    SUPABASE_URL: process.env['EXPO_PUBLIC_SUPABASE_URL'],
    SUPABASE_ANON_KEY: process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'],
    APP_ENV: process.env['EXPO_PUBLIC_APP_ENV'] ?? process.env['APP_ENV'],
    REVENUECAT_API_KEY_IOS: process.env['EXPO_PUBLIC_REVENUECAT_API_KEY_IOS'],
    REVENUECAT_API_KEY_ANDROID: process.env['EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID'],
    GOOGLE_WEB_CLIENT_ID: process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'],
    ONESIGNAL_APP_ID: process.env['EXPO_PUBLIC_ONESIGNAL_APP_ID'],
    FEEDBACK_RELAY_ENDPOINT: process.env['EXPO_PUBLIC_FEEDBACK_RELAY_ENDPOINT'],
    FEEDBACK_API_KEY: process.env['EXPO_PUBLIC_FEEDBACK_API_KEY'],
    FEEDBACK_APP_ID: process.env['EXPO_PUBLIC_FEEDBACK_APP_ID'],
  });

  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    if (__DEV__) {
      console.warn(`[ENV] Missing or invalid environment variables:\n${messages}`);
    }
    // Don't throw in early iterations — Supabase vars are optional for now
  }

  return (result.data ?? {}) as Env;
}

export const env = parseEnv();
