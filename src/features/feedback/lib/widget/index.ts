/**
 * Logic-only barrel for the vendored FeedbackBridge widget.
 * The starter renders its own HeroUI-based UI, so the upstream
 * <FeedbackWidget /> component is intentionally NOT exported.
 */
export type { DeviceInfo, DraftStorageProp, PickedScreenshot, WidgetState } from './types';
export { useDeviceInfo } from './hooks/useDeviceInfo';
export { useDraft } from './hooks/useDraft';
export type { UseDraftOptions, UseDraftResult } from './hooks/useDraft';
export {
  type DraftStorage,
  type DraftValue,
  DRAFT_DEBOUNCE_MS,
  DRAFT_TTL_MS,
  buildDraftKey,
  clearDraft,
  loadDraft,
  saveDraft,
} from './services/draftStore';
export {
  type FeedbackSubmissionPayload,
  type SubmitFailureReason,
  type SubmitFeedbackInput,
  type SubmitFeedbackResult,
  submitFeedback,
} from './services/relay';
export {
  DEFAULT_MAX_SCREENSHOT_BYTES,
  decodedByteLength,
  isWithinSizeLimit,
} from './services/screenshotSize';
export { resolveI18n } from './i18n';
export type { I18nResolvedOptions, TranslationKey, TranslationPack } from './i18n';
