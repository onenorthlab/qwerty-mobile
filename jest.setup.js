/**
 * Jest setup — runs after jest-expo's preset setup.
 *
 * Expo SDK 55's "winter runtime" (installGlobal.ts) installs lazy getters
 * on globalThis for __ExpoImportMetaRegistry and structuredClone.
 * These getters fire dynamic import() calls that fail in Jest/CJS.
 *
 * Override both with non-dynamic stub implementations.
 */

// Override __ExpoImportMetaRegistry (used by import.meta polyfill)
try {
  Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: { get: () => null, set: () => {} },
    writable: true,
    configurable: true,
    enumerable: true,
  });
} catch (_) {
  global.__ExpoImportMetaRegistry = { get: () => null, set: () => {} };
}

// Override structuredClone if expo replaced it with a lazy getter
try {
  const sc = (obj) => JSON.parse(JSON.stringify(obj));
  Object.defineProperty(global, 'structuredClone', {
    value: sc,
    writable: true,
    configurable: true,
    enumerable: true,
  });
} catch (_) {
  // Node already has it — leave it
}

// Silence expected console.warn in tests
global.console.warn = jest.fn();
