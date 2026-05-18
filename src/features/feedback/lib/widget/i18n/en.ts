export const en = {
  trigger_label: 'Send feedback',
  title: 'Send feedback',
  description_label: 'Description',
  description_placeholder: "What's wrong, or what's your question?",
  email_label: 'Email (optional)',
  email_placeholder: 'you@example.com',
  device_preview: 'Platform: {platform} {osVersion} · {deviceModel}',
  screenshot_pick: 'Choose from album',
  screenshot_attached: 'Screenshot attached',
  screenshot_remove: 'Remove',
  screenshot_too_large: 'Screenshot exceeds {maxKb}KB. Compress and try again.',
  submit: 'Submit',
  submitting: 'Sending…',
  retry: 'Retry',
  close: 'Close',
  success_title: 'Thanks! Your feedback was submitted.',
  success_meta: 'Issue #{issueNumber}',
  error_default: 'Submission failed.',
  auto_capture_title: 'Screenshot detected',
  auto_capture_message: 'Send feedback with this screenshot?',
  auto_capture_confirm: 'Send feedback',
  auto_capture_cancel: 'Not now',
};

export type TranslationKey = keyof typeof en;
export type TranslationPack = Partial<Record<TranslationKey, string>>;
