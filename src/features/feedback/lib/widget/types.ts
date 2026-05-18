/**
 * Vendored from FeedbackBridge widget (logic-only). UI types are kept; the
 * starter renders its own HeroUI-based component instead of the original
 * <FeedbackWidget /> from the upstream package.
 */

export interface DraftStorageProp {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface PickedScreenshot {
  /** Raw base64 of the encoded image (no `data:` prefix). */
  base64: string;
  /** Optional MIME hint, e.g. "image/jpeg". Currently unused by the relay. */
  mimeType?: string;
}

export type WidgetState =
  | { kind: 'HIDDEN' }
  | { kind: 'EDITING' }
  | { kind: 'UPLOADING' }
  | { kind: 'SUCCESS'; issueNumber: number; issueUrl: string }
  | { kind: 'ERROR'; message: string; retryable: boolean };

export interface DeviceInfo {
  platform: 'ios' | 'android' | string;
  osVersion: string;
  deviceModel: string;
}
