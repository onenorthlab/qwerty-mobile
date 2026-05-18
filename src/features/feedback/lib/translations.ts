import type { TranslationPack } from './widget';

const zh: TranslationPack = {
  trigger_label: '发送反馈',
  title: '发送反馈',
  description_label: '描述',
  description_placeholder: '遇到了什么问题，或者有什么疑问？',
  email_label: '邮箱（可选）',
  email_placeholder: 'you@example.com',
  device_preview: '平台：{platform} {osVersion} · {deviceModel}',
  screenshot_pick: '从相册选择',
  screenshot_attached: '已添加截图',
  screenshot_remove: '移除',
  screenshot_too_large: '截图超过 {maxKb}KB，请压缩后再试。',
  submit: '提交',
  submitting: '正在发送…',
  retry: '重试',
  close: '关闭',
  success_title: '感谢反馈！我们已收到。',
  success_meta: 'Issue #{issueNumber}',
  error_default: '提交失败。',
  auto_capture_title: '检测到截图',
  auto_capture_message: '是否基于这张截图提交反馈？',
  auto_capture_confirm: '去反馈',
  auto_capture_cancel: '暂不',
};

export const widgetExtraTranslations: Record<string, TranslationPack> = {
  zh,
  'zh-CN': zh,
  'zh-TW': zh,
  'zh-HK': zh,
};
