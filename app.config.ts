import { ConfigContext, ExpoConfig } from 'expo/config';

const APP_ENV = (process.env.APP_ENV ?? 'development') as keyof typeof configs;
// Apple Developer Team ID — required for NSE (OneSignal) signing on physical devices.
// Find it at: developer.apple.com → Account → Membership → Team ID
// Add APPLE_TEAM_ID=XXXXXXXXXX to your .env file.
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;

const configs = {
  development: { name: 'OneRN (Dev)', bundleId: 'com.onern.starter.dev' },
  staging: { name: 'OneRN (Beta)', bundleId: 'com.onern.starter.staging' },
  production: { name: 'OneRN', bundleId: 'com.onern.starter' },
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: configs[APP_ENV].name,
  slug: 'one-rn-starter2',
  scheme: 'onern',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: configs[APP_ENV].bundleId,
    supportsTablet: false,
    ...(APPLE_TEAM_ID ? { appleTeamId: APPLE_TEAM_ID } : {}),
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'Used to attach screenshots to feedback you submit.'
    },
  },
  android: {
    package: configs[APP_ENV].bundleId,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  plugins: [
    ['expo-router', { root: './src/app' }],
    'expo-font',
    'expo-splash-screen',
    'expo-secure-store',
    'expo-localization',
    'expo-web-browser',
    'expo-apple-authentication',
    [
      'onesignal-expo-plugin',
      {
        mode: APP_ENV === 'production' ? 'production' : 'development',
        iPhoneDeploymentTarget: '15.1',
      },
    ],
    'expo-notifications',
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow $(PRODUCT_NAME) to access your photos to attach screenshots when you submit feedback.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission:
          'Allow $(PRODUCT_NAME) to read your latest screenshot when you choose to send feedback.',
        savePhotosPermission: false,
        // Required by getAssetInfoAsync to read EXIF; on Android 14 it is
        // bundled with the Photos permission grant — no separate prompt.
        isAccessMediaLocationEnabled: true,
      },
    ],
    // expo-screen-capture has no config plugin — it only uses runtime
    // permissions. Don't list it here.
    './plugins/withNSEAutoSigning',
  ],
});
