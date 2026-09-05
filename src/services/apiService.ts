/**
 * API Service — frontend HTTP client for the Cloud Run backend.
 *
 * All Gemini operations route through this service. It sends the Firebase ID token
 * in the Authorization header; the backend verifies it and derives the uid server-side.
 *
 * STUB: All functions currently return a descriptive error until the Cloud Run
 * backend is deployed and VITE_CLOUD_RUN_API_URL is configured.
 *
 * To activate:
 *   1. Deploy the backend (personal-ai-journal/backend/)
 *   2. Set VITE_CLOUD_RUN_API_URL=https://your-service.run.app in .env.local
 *
 * IMPORTANT: Gemini API credentials are NEVER placed in frontend env vars.
 * They live in Google Cloud Secret Manager, mounted into the Cloud Run service.
 */

import type { AIReflection, ChatMessage, ReflectionMode, WeeklyInsight } from '../types/index';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_CLOUD_RUN_API_URL as string | undefined;

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(
  idToken: string,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      503,
      'Cloud Run backend is not yet configured. ' +
        'Set VITE_CLOUD_RUN_API_URL in .env.local once the backend is deployed.',
    );
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API surface
// ---------------------------------------------------------------------------

/**
 * Ask Gemini to produce a plain-text summary of the supplied content.
 * The backend returns a string summary.
 * Original content is NEVER sent to overwrite anything — it is read-only input.
 */
export async function generateSummary(
  idToken: string,
  content: string,
): Promise<string> {
  const result = await apiFetch<{ summary: string }>(idToken, '/api/summarize', {
    content,
  });
  return result.summary;
}

/**
 * Ask Gemini for the next conversational reply.
 */
export async function generateChatReply(
  idToken: string,
  history: ChatMessage[],
  latestText: string,
): Promise<string> {
  const result = await apiFetch<{ reply: string }>(idToken, '/api/chat', {
    history,
    latestText,
  });
  return result.reply;
}

/**
 * Ask Gemini to produce a structured AIReflection from writing or conversation.
 */
export async function generateReflection(
  idToken: string,
  mode: ReflectionMode,
  content: string,
  conversation?: ChatMessage[],
): Promise<AIReflection> {
  const result = await apiFetch<{ reflection: AIReflection }>(
    idToken,
    '/api/reflection',
    { mode, content, conversation },
  );
  // Normalise generatedAt from ISO string to Date
  return {
    ...result.reflection,
    generatedAt: new Date(result.reflection.generatedAt as unknown as string),
  };
}

/**
 * Ask the backend to analyse this week's entries for the authenticated user
 * and store the resulting WeeklyInsight in Firestore.
 * The backend reads entries using Admin SDK (uid from token — never from client).
 */
export async function generateWeeklyInsights(
  idToken: string,
): Promise<WeeklyInsight> {
  const result = await apiFetch<{ insight: WeeklyInsight }>(
    idToken,
    '/api/weekly-insights',
    {},
  );
  return {
    ...result.insight,
    generatedAt: new Date(result.insight.generatedAt as unknown as string),
  };
}

export { ApiError };
