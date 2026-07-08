"use client";

export function SettingsForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial: Record<string, string>;
}) {
  const v = (k: string) => initial[k] ?? "";
  return (
    <form action={action} className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Homepage</h2>
        <div>
          <label className="label" htmlFor="siteTagline">Site tagline</label>
          <input id="siteTagline" name="siteTagline" className="input" defaultValue={v("siteTagline")} />
        </div>
        <div>
          <label className="label" htmlFor="homeIntro">Home intro text</label>
          <textarea id="homeIntro" name="homeIntro" rows={3} className="input" defaultValue={v("homeIntro")} />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">About page</h2>
        <div>
          <label className="label" htmlFor="aboutContent">About content (Markdown)</label>
          <textarea id="aboutContent" name="aboutContent" rows={8} className="input font-mono text-sm" defaultValue={v("aboutContent")} />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Support & Contact</h2>
        <div>
          <label className="label" htmlFor="supportMessage">Support message</label>
          <textarea id="supportMessage" name="supportMessage" rows={3} className="input" defaultValue={v("supportMessage")} />
        </div>
        <div>
          <label className="label" htmlFor="supportEmail">Support email</label>
          <input id="supportEmail" name="supportEmail" type="email" className="input" defaultValue={v("supportEmail")} />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Socials & Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="discordInvite">Discord invite URL</label>
            <input id="discordInvite" name="discordInvite" className="input" defaultValue={v("discordInvite")} />
          </div>
          <div>
            <label className="label" htmlFor="vrchatGroupUrl">VRChat group URL</label>
            <input id="vrchatGroupUrl" name="vrchatGroupUrl" className="input" defaultValue={v("vrchatGroupUrl")} />
          </div>
          <div>
            <label className="label" htmlFor="socialDiscord">Discord (social link)</label>
            <input id="socialDiscord" name="socialDiscord" className="input" defaultValue={v("socialDiscord")} />
          </div>
          <div>
            <label className="label" htmlFor="socialTwitter">Twitter / X</label>
            <input id="socialTwitter" name="socialTwitter" className="input" defaultValue={v("socialTwitter")} />
          </div>
          <div>
            <label className="label" htmlFor="socialInstagram">Instagram</label>
            <input id="socialInstagram" name="socialInstagram" className="input" defaultValue={v("socialInstagram")} />
          </div>
          <div>
            <label className="label" htmlFor="socialTiktok">TikTok</label>
            <input id="socialTiktok" name="socialTiktok" className="input" defaultValue={v("socialTiktok")} />
          </div>
          <div>
            <label className="label" htmlFor="socialYoutube">YouTube</label>
            <input id="socialYoutube" name="socialYoutube" className="input" defaultValue={v("socialYoutube")} />
          </div>
        </div>
      </section>

      <button type="submit" className="btn-primary">Save settings</button>
    </form>
  );
}
