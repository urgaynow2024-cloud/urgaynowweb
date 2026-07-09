/**
 * Runs an async query and returns a fallback if it throws (e.g. the database
 * is unreachable during build-time prerendering). Pages still get real data at
 * runtime via ISR, and the production build never fails because the DB is down
 * at build time.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
