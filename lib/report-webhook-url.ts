/**
 * Webhook URL validation for the report system.
 *
 * Kept free of server-only imports so it can be unit tested directly. Only
 * Discord webhook URLs are ever accepted: this stops an attacker-controlled
 * value (for example from the admin settings screen) from turning the server
 * into a request proxy for arbitrary hosts.
 */

const ALLOWED_HOSTS = new Set([
  "discord.com",
  "discordapp.com",
  "canary.discord.com",
  "ptb.discord.com",
]);

export function isAllowedDiscordWebhook(value: string): boolean {
  let url: URL;
  try {
    url = new URL(normalizeWebhookUrl(value));
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return false;
  if (!url.pathname.startsWith("/api/webhooks/")) return false;
  // /api/webhooks/{webhook.id}/{webhook.token}
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length < 4) return false;
  if (segments[2].length < 5) return false;
  if (segments.slice(3).join("/").length < 10) return false;
  // Credentials in the URL would leak into logs; reject.
  if (url.username || url.password) return false;
  return true;
}

/**
 * Strips stray wrapping quotes and whitespace from a configured webhook URL.
 *
 * Some deployment environments store the value with an unbalanced quote (for
 * example `DISCORD_REPORTS_WEBHOOK_URL="https://discord.com/...` with no
 * closing quote), which would otherwise make the URL unparseable and silently
 * stop all staff notifications.
 */
export function normalizeWebhookUrl(value: string): string {
  let normalized = String(value ?? "").trim();
  normalized = normalized.replace(/^["']+/, "").replace(/["']+$/, "");
  return normalized.trim();
}