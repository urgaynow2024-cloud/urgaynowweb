"use client";

import { useState } from "react";

type Status = "idle" | "saving" | "done" | "error";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DISCORD_RE = /^https:\/\/discord\.com\/api\/webhooks\//;

/**
 * Subscription form with client-side validation (mirrors the server rules),
 * rate-limit-friendly inputs, a honeypot, and links to RSS/Atom feeds. Webhook
 * secrets are sent to the server but never displayed back to the visitor.
 */
export function StatusSubscribeForm() {
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; discord?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { email?: string; discord?: string } = {};
    if (email && !EMAIL_RE.test(email)) errs.email = "Enter a valid email address.";
    if (discord && !DISCORD_RE.test(discord)) errs.discord = "Use a https://discord.com/api/webhooks/ URL.";
    if (!email && !discord) errs.email = "Provide an email or Discord webhook.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined, discordWebhook: discord.trim() || undefined }),
      });
      if (res.status === 429) throw new Error("rate");
      if (!res.ok) throw new Error("bad");
      setStatus("done");
      setMessage("Subscribed! We’ll notify you of incidents and maintenance.");
      setEmail("");
      setDiscord("");
    } catch (e: any) {
      setStatus("error");
      setMessage(
        e?.message === "rate"
          ? "Too many attempts. Please try again in a few minutes."
          : "Could not subscribe right now. Please try again.",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className="input"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Discord Webhook <span className="text-zinc-400">(optional)</span>
          </span>
          <input
            type="url"
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            placeholder="https://discord.com/api/webhooks/…"
            aria-invalid={!!errors.discord}
            className="input"
          />
          {errors.discord && <span className="field-error">{errors.discord}</span>}
        </label>
        {/* Honeypot — hidden from humans, tempting to bots */}
        <div className="hidden" aria-hidden>
          <label>
            Company
            <input type="text" tabIndex={-1} autoComplete="off" name="company" />
          </label>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={status === "saving"} className="btn-primary">
            {status === "saving" ? "Subscribing…" : "Subscribe to updates"}
          </button>
        </div>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${status === "error" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
          {message}
        </p>
      )}
      <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <span>Or follow a feed:</span>
        <a href="/status/rss.xml" className="font-medium text-brand-600 hover:underline dark:text-brand-300">RSS</a>
        <a href="/status/atom.xml" className="font-medium text-brand-600 hover:underline dark:text-brand-300">Atom</a>
      </p>
    </div>
  );
}
