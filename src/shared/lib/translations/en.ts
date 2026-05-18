export default {
  // Common
  appName: 'OneRN Starter',
  subtitle: 'Expo SDK 55 + React Native 0.83 + React 19.2',
  getStarted: 'Get Started',

  // Feature cards
  feature_tailwind: 'Tailwind + Uniwind',
  feature_tailwind_desc: 'Utility-first styling on RN',
  feature_typescript: 'TypeScript Strict',
  feature_typescript_desc: 'Full type safety with path aliases',
  feature_heroui: 'HeroUI Native + Lucide',
  feature_heroui_desc: 'Production-ready UI components',
  feature_mmkv: 'MMKV + SecureStore',
  feature_mmkv_desc: 'Encrypted storage with Inter font',
  feature_state: 'Zustand + TanStack Query + Zod',
  feature_state_desc: 'State management + form validation',
  feature_i18n: 'i18n + Expo Router',
  feature_i18n_desc: 'Multi-language with tab navigation',
  feature_supabase: 'Supabase Auth',
  feature_supabase_desc: 'Apple OAuth + email auth with MMKV session',
  feature_onesignal: 'OneSignal + expo-notifications',
  feature_onesignal_desc: 'Remote push + local notifications + per-device management',
  feature_revenuecat: 'RevenueCat IAP',
  feature_revenuecat_desc: 'Subscriptions + one-time purchase with entitlement management',

  // Tabs
  tab_home: 'Home',
  tab_explore: 'Explore',
  tab_settings: 'Settings',

  // Settings
  settings_title: 'Settings',
  settings_theme: 'Theme',
  settings_theme_light: 'Light',
  settings_theme_dark: 'Dark',
  settings_theme_system: 'System',
  settings_language: 'Language',
  settings_lang_en: 'English',
  settings_lang_zh: '中文',
  settings_lang_system: 'System',
  settings_notifications: 'Notifications',
  settings_notifications_desc: 'Enable push notifications',
  settings_notifications_permission_denied:
    'Notifications are disabled. Please enable them in your device Settings.',
  settings_manage_devices: 'Manage Devices',
  settings_manage_devices_desc: 'Control push notifications per device',
  settings_feedback: 'Feedback',
  settings_feedback_send: 'Send feedback',
  settings_feedback_desc: 'Report a bug or suggest an improvement',
  settings_reset: 'Reset Settings',

  // Pro / subscription
  settings_pro: 'Pro',
  settings_pro_active: 'Pro Active',
  settings_pro_active_desc: 'All premium features unlocked',
  settings_manage_subscription: 'Manage Subscription',
  settings_upgrade: 'Upgrade to Pro',
  settings_upgrade_desc: 'Unlock all premium features',

  // Paywall
  paywall_title: 'Upgrade to Pro',
  paywall_subtitle: 'Get access to all premium features',
  paywall_features_title: "Everything in Pro:",
  paywall_feature_1: 'Unlimited access to all features',
  paywall_feature_2: 'Priority customer support',
  paywall_feature_3: 'No ads, ever',
  paywall_feature_4: 'Early access to new features',
  paywall_monthly: 'Monthly',
  paywall_annual: 'Annual',
  paywall_lifetime: 'Lifetime',
  paywall_per_month: 'per month',
  paywall_per_year: 'per year',
  paywall_one_time: 'one-time payment',
  paywall_most_popular: 'Most Popular',
  paywall_best_value: 'Best Value',
  paywall_cta: 'Get Pro',
  paywall_restore: 'Restore Purchases',
  paywall_restoring: 'Restoring...',
  paywall_restore_success: 'Purchases restored!',
  paywall_restore_none: 'No previous purchases found',
  paywall_restore_error: 'Restore failed. Please try again.',
  paywall_purchase_error: 'Purchase failed. Please try again.',
  paywall_loading: 'Loading products...',
  paywall_terms: 'Payment will be charged to your Apple ID. Subscriptions auto-renew unless cancelled.',

  // Device management screen
  devices_title: 'Devices',
  devices_empty: 'No devices registered yet',
  devices_empty_desc: 'Enable notifications to register this device',
  devices_current: 'This Device',
  devices_push_enabled: 'Push Notifications',
  devices_last_seen: 'Last seen',
  devices_delete: 'Remove',
  devices_delete_confirm_title: 'Remove Device',
  devices_delete_confirm_msg: 'This device will no longer receive push notifications. You can re-register by re-enabling notifications.',
  devices_delete_cancel: 'Cancel',
  devices_platform_ios: 'iPhone / iPad',
  devices_platform_android: 'Android',
  devices_platform_web: 'Web',
  devices_unknown_name: 'Unknown Device',

  // Explore
  explore_title: 'Explore',
  explore_desc: 'This screen demonstrates route structure.',

  // Auth
  auth_login: 'Log In',
  auth_signup: 'Sign Up',
  auth_login_subtitle: 'Sign in to your account',
  auth_signup_subtitle: 'Create a new account',
  auth_email_placeholder: 'Email',
  auth_password_placeholder: 'Password',
  auth_signing_in: 'Signing in...',
  auth_signing_up: 'Signing up...',
  auth_continue_with_apple: 'Continue with Apple',
  auth_or: 'OR',
  auth_switch_to_signup: "Don't have an account? Sign Up",
  auth_switch_to_login: 'Already have an account? Log In',
  auth_skip_dev: 'Skip (Dev Mode)',
  auth_signup_success_title: 'Check your email',
  auth_signup_success_msg: 'We sent you a confirmation link. Please verify your email to continue.',
  auth_placeholder: 'Auth screens will be implemented with Supabase.',

  // Tabs (Phase 2)
  tab_dict: 'Dictionaries',
  tab_practice: 'Practice',
  tab_progress: 'Progress',

  // Home
  home_title: 'Pick a dictionary',
  home_subtitle: 'Listen and type — practice spelling by ear.',
  home_start_practice: 'Start practicing',
  home_footer_tip: 'Tip: tap the speaker icon to replay the word.',

  // Dictionary picker
  dict_picker_label: 'Available dictionaries',
  dict_word_count_suffix: 'words',

  // Practice screen wrapper
  practice_no_dict: 'No dictionary selected yet.',
  practice_go_home: 'Back to dictionaries',
  practice_chapter_progress: 'Chapter {{current}} of {{total}}',
  practice_session_length: '{{count}} words this round',

  // Typing
  typing_empty: 'This chapter is empty. Try another one.',
  typing_back: 'Exit practice',
  typing_replay: 'Replay',
  typing_hint_translation: 'Translation',
  typing_input_hint: 'Type what you hear, then it will auto-advance.',
  typing_wrong_retry: 'Wrong — please try again.',

  // Result
  result_title: 'Round complete',
  result_subtitle: '{{count}} words finished',
  result_wpm: 'WPM',
  result_accuracy: 'Accuracy',
  result_time: 'Time',
  result_mistakes_header: '{{count}} word(s) with mistakes',
  result_mistakes_attempts: 'attempts',
  result_no_mistakes: 'Flawless run — well done!',
  result_restart: 'Practice again',
  result_back: 'Back to dictionaries',

  // Errorbook
  errorbook_title: 'Mistakes',
  errorbook_subtitle: 'Words you misspelled most recently.',
  errorbook_empty_title: 'No mistakes yet',
  errorbook_empty_desc: 'Practice a round to start tracking what you got wrong.',
  errorbook_chapter: 'Chapter {{chapter}}',
} as const;
