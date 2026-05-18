/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|expo-modules-core' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|@unimodules/.*' +
      '|unimodules' +
      '|react-native-svg' +
      '|lucide-react-native' +
      '|heroui-native' +
      '|@gorhom/.*' +
      '|zustand' +
      '|@tanstack/.*' +
      '|i18next' +
      '|react-i18next' +
      '|zod' +
      '|@supabase/.*' +
      ')/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    // Stub out the Expo winter runtime that uses import.meta
    '^expo/src/winter/.*$': '<rootDir>/__mocks__/expo-winter-stub.js',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',
  ],
};
