/**
 * SSR-safe localStorage helpers. Every access is guarded with
 * `typeof window === "undefined"` (matching the pattern in services/api.ts) so
 * these can be imported anywhere without breaking server rendering, and reads
 * never throw on corrupt data or writes on quota/private-mode errors.
 */

export function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStorage<T>(key: string, value: T | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value == null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore write failures (quota exceeded, private browsing, etc.) — losing
    // a cached value is preferable to crashing the UI.
  }
}
