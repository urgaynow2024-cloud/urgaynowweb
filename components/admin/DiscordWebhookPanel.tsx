"use client";

import { useEffect, useState } from "react";

export type DiscordWebhookPanelProps = {
  /** Controlled list of selected Discord role IDs. */
  roleIds: string[];
  onRoleIdsChange: (ids: string[]) => void;
  /** When true the parent will post to Discord on save. */
  postToDiscord: boolean;
  onPostToDiscordChange: (v: boolean) => void;
};

/**
 * Shared panel for "Post to Discord" + role picker.
 * Roles are fetched once from GET /api/discord/roles; the list is empty
 * when Discord isn't configured, which keeps the panel harmless.
 */
export function DiscordWebhookPanel({
  roleIds,
  onRoleIdsChange,
  postToDiscord,
  onPostToDiscordChange,
}: DiscordWebhookPanelProps) {
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/discord/roles")
      .then((r) => r.json())
      .then((data) => {
        if (active) setRoles(Array.isArray(data.roles) ? data.roles : []);
      })
      .catch(() => {
        if (active) setRoles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function toggle(id: string) {
    onRoleIdsChange(
      roleIds.includes(id)
        ? roleIds.filter((r) => r !== id)
        : [...roleIds, id],
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-surface-50 p-5 dark:border-ink-800 dark:bg-ink-900/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-900 dark:text-white">Discord notification</h3>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            Post a branded alert to the community server when this is published.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
          <input
            type="checkbox"
            checked={postToDiscord}
            onChange={(e) => onPostToDiscordChange(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300"
          />
          Post to Discord
        </label>
      </div>

      {postToDiscord && (
        <div className="mt-4">
          <span className="field-label">Mention roles (optional)</span>
          {loading ? (
            <p className="text-xs text-ink-400">Loading Discord roles…</p>
          ) : roles.length === 0 ? (
            <p className="text-xs text-ink-400">
              Discord isn&rsquo;t configured or the bot can&rsquo;t see roles. The post will still go out without mentions.
            </p>
          ) : (
            <div className="mt-1.5 flex flex-wrap gap-2">
              {roles.map((role) => {
                const selected = roleIds.includes(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggle(role.id)}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/40 dark:text-brand-200"
                        : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300"
                    }`}
                  >
                    @{role.name}
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">
            Only roles the bot can see are listed. @here and @everyone are never allowed.
          </p>
        </div>
      )}
    </div>
  );
}