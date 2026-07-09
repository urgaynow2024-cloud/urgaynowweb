/**
 * Runs an async query and returns a fallback if it throws (e.g. the database
 * is unreachable during build-time prerendering). Pages still get real data at
 * runtime via ISR, and the production build never fails because the DB is down
 * at build time.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // Surface the failure instead of silently rendering empty content — a DB
    // error here looks exactly like "content disappeared" to visitors.
    const message = err instanceof Error ? err.message : String(err);
    console.error("[safeQuery] Query failed, using fallback:", message);
    return fallback;
  }
}
