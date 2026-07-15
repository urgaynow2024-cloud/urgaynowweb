"use client";

import { useState } from "react";

type Status = "idle" | "saving" | "done" | "error";

export function StatusSubscribeForm() {
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !discord) {
      setStatus("error");
      setMessage("Enter an email or Discord webhook to subscribe.");
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined, discordWebhook: discord.trim() || undefined }),
      });
      if (!res.ok) throw new Error("bad");
      setStatus("done");
      setMessage("Subscribed! We’ll notify you of incidents and maintenance.");
      setEmail("");
      setDiscord("");
    } catch {
      setStatus("error");
      setMessage("Could not subscribe right now. Please try again.");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-zinc-200 p-6 dark:border-zinc-800">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
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
            className="input"
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" disabled={status === "saving"} className="btn-primary">
            {status === "saving" ? "Subscribing…" : "Subscribe to updates"}
          </button>
        </div>
        {message && (
          <p className={`sm:col-span-2 text-sm ${status === "error" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
            {message}
          </p>
        )}
      </form>
      <p className="mt-3 text-xs text-zinc-400">
        You can also follow our RSS feed at <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">/status/rss.xml</code>.
      </p>
    </div>
  );
}
