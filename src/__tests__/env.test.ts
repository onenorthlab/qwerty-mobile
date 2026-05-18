/**
 * Tests for environment variable validation (Zod schema)
 * Uses jest.isolateModules + require() to test with different env vars
 */

describe('env validation schema', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('parses valid Supabase URL and anon key', () => {
    process.env['EXPO_PUBLIC_SUPABASE_URL'] = 'https://abc.supabase.co';
    process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiJ9.test';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { env } = require('../shared/config/env') as typeof import('../shared/config/env');

    expect(env.SUPABASE_URL).toBe('https://abc.supabase.co');
    expect(env.SUPABASE_ANON_KEY).toBe('eyJhbGciOiJIUzI1NiJ9.test');
  });

  it('defaults APP_ENV to development when unset', () => {
    delete process.env['EXPO_PUBLIC_APP_ENV'];
    delete process.env['APP_ENV'];

    const { env } = require('../shared/config/env') as typeof import('../shared/config/env');

    expect(env.APP_ENV).toBe('development');
  });

  it('accepts all three APP_ENV values', () => {
    for (const value of ['development', 'staging', 'production'] as const) {
      jest.resetModules();
      process.env['EXPO_PUBLIC_APP_ENV'] = value;
      const { env } = require('../shared/config/env') as typeof import('../shared/config/env');
      expect(env.APP_ENV).toBe(value);
    }
  });

  it('treats missing Supabase vars as optional (no throw)', () => {
    delete process.env['EXPO_PUBLIC_SUPABASE_URL'];
    delete process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

    expect(() => require('../shared/config/env')).not.toThrow();
  });
});
