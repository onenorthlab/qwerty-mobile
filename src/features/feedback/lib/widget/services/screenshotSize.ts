export const DEFAULT_MAX_SCREENSHOT_BYTES = 800 * 1024;

/**
 * Returns the decoded byte length of a base64 string without actually
 * decoding it. base64 encodes every 3 bytes of input as 4 characters,
 * with `=` padding for inputs whose length is not a multiple of 3.
 */
export function decodedByteLength(base64: string): number {
  if (!base64) return 0;
  const normalized = base64.replace(/\s/g, '');
  if (!normalized) return 0;
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

export function isWithinSizeLimit(
  base64: string,
  limit: number = DEFAULT_MAX_SCREENSHOT_BYTES,
): boolean {
  return decodedByteLength(base64) <= limit;
}
