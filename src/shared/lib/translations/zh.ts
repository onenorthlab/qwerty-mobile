export default {
  // Common
  appName: 'OneRN 起步模板',
  subtitle: 'Expo SDK 55 + React Native 0.83 + React 19.2',
  getStarted: '开始使用',

  // Feature cards
  feature_tailwind: 'Tailwind + Uniwind',
  feature_tailwind_desc: 'RN 上的原子化样式方案',
  feature_typescript: 'TypeScript 严格模式',
  feature_typescript_desc: '完整的类型安全与路径别名',
  feature_heroui: 'HeroUI Native + Lucide',
  feature_heroui_desc: '生产级 UI 组件库',
  feature_mmkv: 'MMKV + SecureStore',
  feature_mmkv_desc: '加密存储 + Inter 字体',
  feature_state: 'Zustand + TanStack Query + Zod',
  feature_state_desc: '状态管理 + 表单校验',
  feature_i18n: 'i18n + Expo Router',
  feature_i18n_desc: '多语言支持与标签导航',
  feature_supabase: 'Supabase 认证',
  feature_supabase_desc: 'Apple OAuth + 邮箱认证，MMKV 会话持久化',
  feature_onesignal: 'OneSignal + expo-notifications',
  feature_onesignal_desc: '远程推送 + 本地通知 + 按设备精细管控',
  feature_revenuecat: 'RevenueCat IAP',
  feature_revenuecat_desc: '订阅 + 一次性内购，含权益管理',

  // Tabs
  tab_home: '首页',
  tab_explore: '探索',
  tab_settings: '设置',

  // Settings
  settings_title: '设置',
  settings_theme: '主题',
  settings_theme_light: '浅色',
  settings_theme_dark: '深色',
  settings_theme_system: '跟随系统',
  settings_language: '语言',
  settings_lang_en: 'English',
  settings_lang_zh: '中文',
  settings_lang_system: '跟随系统',
  settings_notifications: '通知',
  settings_notifications_desc: '启用推送通知',
  settings_notifications_permission_denied:
    '通知已被禁用。请在设备设置中启用。',
  settings_manage_devices: '设备管理',
  settings_manage_devices_desc: '为每台设备单独控制推送通知',
  settings_feedback: '反馈',
  settings_feedback_send: '发送反馈',
  settings_feedback_desc: '提交 Bug 或功能建议',
  settings_reset: '重置设置',

  // Pro / subscription
  settings_pro: 'Pro',
  settings_pro_active: 'Pro 已激活',
  settings_pro_active_desc: '全部高级功能已解锁',
  settings_manage_subscription: '管理订阅',
  settings_upgrade: '升级 Pro',
  settings_upgrade_desc: '解锁全部高级功能',

  // Paywall
  paywall_title: '升级 Pro',
  paywall_subtitle: '解锁全部高级功能',
  paywall_features_title: 'Pro 包含以下权益：',
  paywall_feature_1: '无限使用所有功能',
  paywall_feature_2: '优先客户支持',
  paywall_feature_3: '永久无广告',
  paywall_feature_4: '新功能优先体验',
  paywall_monthly: '月订阅',
  paywall_annual: '年订阅',
  paywall_lifetime: '终身授权',
  paywall_per_month: '每月',
  paywall_per_year: '每年',
  paywall_one_time: '一次性付款',
  paywall_most_popular: '最受欢迎',
  paywall_best_value: '超值之选',
  paywall_cta: '立即开通',
  paywall_restore: '恢复购买',
  paywall_restoring: '正在恢复...',
  paywall_restore_success: '购买已成功恢复！',
  paywall_restore_none: '未找到历史购买记录',
  paywall_restore_error: '恢复失败，请重试。',
  paywall_purchase_error: '购买失败，请重试。',
  paywall_loading: '正在加载产品...',
  paywall_terms: '费用将从 Apple ID 账户扣除。订阅将自动续费，可随时取消。',

  // Device management screen
  devices_title: '设备列表',
  devices_empty: '暂无已注册的设备',
  devices_empty_desc: '启用通知后，当前设备将自动注册',
  devices_current: '本设备',
  devices_push_enabled: '推送通知',
  devices_last_seen: '最近活跃',
  devices_delete: '移除',
  devices_delete_confirm_title: '移除设备',
  devices_delete_confirm_msg: '该设备将不再接收推送通知。重新启用通知可重新注册。',
  devices_delete_cancel: '取消',
  devices_platform_ios: 'iPhone / iPad',
  devices_platform_android: 'Android',
  devices_platform_web: 'Web',
  devices_unknown_name: '未知设备',

  // Explore
  explore_title: '探索',
  explore_desc: '本页面展示路由结构。',

  // Auth
  auth_login: '登录',
  auth_signup: '注册',
  auth_login_subtitle: '登录你的账户',
  auth_signup_subtitle: '创建新账户',
  auth_email_placeholder: '邮箱',
  auth_password_placeholder: '密码',
  auth_signing_in: '登录中...',
  auth_signing_up: '注册中...',
  auth_continue_with_apple: '使用 Apple 登录',
  auth_or: '或',
  auth_switch_to_signup: '没有账号？注册',
  auth_switch_to_login: '已有账号？登录',
  auth_skip_dev: '跳过（开发模式）',
  auth_signup_success_title: '请查收邮件',
  auth_signup_success_msg: '我们已向你发送确认链接，请验证邮箱后继续。',
  auth_placeholder: '认证页面将在接入 Supabase 后实现。',

  // Tabs (Phase 2)
  tab_dict: '词库',
  tab_practice: '练习',
  tab_progress: '错题',

  // Home
  home_title: '选一个词库',
  home_subtitle: '听写主打——听发音、用键盘拼出来。',
  home_start_practice: '开始练习',
  home_footer_tip: '提示：点喇叭可以重听这个词。',

  // Dictionary picker
  dict_picker_label: '可用词库',
  dict_word_count_suffix: '词',

  // Practice screen wrapper
  practice_no_dict: '还没选词库。',
  practice_go_home: '回到词库列表',
  practice_chapter_progress: '第 {{current}} / {{total}} 章',
  practice_session_length: '本轮 {{count}} 个词',

  // Typing
  typing_empty: '这一章是空的，换一个试试。',
  typing_back: '退出练习',
  typing_replay: '重听',
  typing_hint_translation: '中文释义',
  typing_input_hint: '听到什么就打什么，全对自动进入下一个。',
  typing_wrong_retry: '错了——重来。',

  // Result
  result_title: '本轮完成',
  result_subtitle: '完成了 {{count}} 个词',
  result_wpm: 'WPM',
  result_accuracy: '正确率',
  result_time: '用时',
  result_mistakes_header: '{{count}} 个词有错',
  result_mistakes_attempts: '次错误',
  result_no_mistakes: '一气呵成——表现完美！',
  result_restart: '再练一轮',
  result_back: '回到词库列表',

  // Errorbook
  errorbook_title: '错题本',
  errorbook_subtitle: '最近拼错的词汇。',
  errorbook_empty_title: '还没有错题',
  errorbook_empty_desc: '练几轮，错过的词会自动出现在这里。',
  errorbook_chapter: '第 {{chapter}} 章',
} as const;
