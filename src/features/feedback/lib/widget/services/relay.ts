export interface FeedbackSubmissionPayload {
  app_id: string;
  description: string;
  app_version: string;
  platform: 'ios' | 'android' | string;
  os_version?: string;
  device_model?: string;
  user_id?: string | null;
  user_email?: string | null;
  device_id?: string | null;
  screenshot?: string | null;
}

export interface SubmitFeedbackInput {
  relayEndpoint: string;
  apiKey: string;
  payload: FeedbackSubmissionPayload;
  signal?: AbortSignal;
}

export type SubmitFailureReason = 'validation' | 'auth' | 'server' | 'network';

export type SubmitFeedbackResult =
  | { ok: true; issue_number: number; issue_url: string }
  | { ok: false; reason: SubmitFailureReason; message?: string; status?: number };

interface ErrorResponseBody {
  error?: { code?: string; message?: string };
}

/**
 * Submits a feedback payload to the FeedbackBridge relay.
 *
 * Returns a discriminated result rather than throwing so callers can render
 * typed UX without try/catch ladders. Failure modes map to a stable reason
 * set: validation (4xx user can fix), auth (401/403), server (5xx),
 * network (fetch threw — offline, DNS, abort).
 */
export async function submitFeedback(input: SubmitFeedbackInput): Promise<SubmitFeedbackResult> {
  const base = input.relayEndpoint.replace(/\/+$/, '');
  const url = base + '/feedback';
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': input.apiKey,
      },
      body: JSON.stringify(input.payload),
      signal: input.signal,
    });
  } catch (err) {
    return {
      ok: false,
      reason: 'network',
      message: err instanceof Error ? err.message : String(err),
    };
  }

  if (res.ok) {
    try {
      const data = (await res.json()) as { issue_number: number; issue_url: string };
      return { ok: true, issue_number: data.issue_number, issue_url: data.issue_url };
    } catch {
      return { ok: false, reason: 'server', message: 'invalid JSON response', status: res.status };
    }
  }

  let message: string | undefined;
  try {
    const data = (await res.json()) as ErrorResponseBody;
    message = data.error?.message;
  } catch {
    // ignore — we still classify by status code
  }

  let reason: SubmitFailureReason;
  if (res.status === 401 || res.status === 403) reason = 'auth';
  else if (res.status >= 400 && res.status < 500) reason = 'validation';
  else reason = 'server';

  return { ok: false, reason, message, status: res.status };
}
