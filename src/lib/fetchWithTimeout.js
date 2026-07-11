export const API_FETCH_TIMEOUT_MS = 8000;

/** Fetch with abort after timeoutMs (default 8s). Existing catch/fallback paths handle AbortError. */
export async function fetchWithTimeout(url, options = {}, timeoutMs = API_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
