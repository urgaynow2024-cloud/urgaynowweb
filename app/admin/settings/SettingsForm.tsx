"use client";

import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconFileText, IconShield, IconBook, IconSettings } from "@/components/admin/ui/icons";

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
      <Card className="animate-fade-in">
        <CardHeader title="Homepage" icon={<IconFileText size={18} />} />
        <CardBody className="space-y-4">
          <div>
            <label className="field-label" htmlFor="siteTagline">Site tagline</label>
            <input id="siteTagline" name="siteTagline" className="input" defaultValue={v("siteTagline")} />
          </div>
          <div>
            <label className="field-label" htmlFor="homeIntro">Home intro text</label>
            <textarea id="homeIntro" name="homeIntro" rows={3} className="input" defaultValue={v("homeIntro")} />
          </div>
        </CardBody>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader title="About page" icon={<IconBook size={18} />} />
        <CardBody>
          <div>
            <label className="field-label" htmlFor="aboutContent">About content (Markdown)</label>
            <textarea id="aboutContent" name="aboutContent" rows={8} className="input font-mono text-sm" defaultValue={v("aboutContent")} />
          </div>
        </CardBody>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader title="Support & Contact" icon={<IconShield size={18} />} />
        <CardBody className="space-y-4">
          <div>
            <label className="field-label" htmlFor="supportMessage">Support message</label>
            <textarea id="supportMessage" name="supportMessage" rows={3} className="input" defaultValue={v("supportMessage")} />
          </div>
          <div>
            <label className="field-label" htmlFor="supportEmail">Support email</label>
            <input id="supportEmail" name="supportEmail" type="email" className="input" defaultValue={v("supportEmail")} />
          </div>
        </CardBody>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader title="Discord import" icon={<IconSettings size={18} />} />
        <CardBody className="space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Connect a Discord bot to import announcements from a Discord channel into the website.
            The bot needs the <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">Read Message History</code> permission in your server.
          </p>
          <div>
            <label className="field-label" htmlFor="discordBotToken">Discord bot token</label>
            <input id="discordBotToken" name="discordBotToken" type="password" autoComplete="off" className="input" defaultValue={v("discordBotToken")} placeholder="Bot token (kept secret)" />
          </div>
          <div>
            <label className="field-label" htmlFor="discordAnnouncementChannelId">Announcement channel ID</label>
            <input id="discordAnnouncementChannelId" name="discordAnnouncementChannelId" className="input" defaultValue={v("discordAnnouncementChannelId")} placeholder="e.g. 123456789012345678" />
          </div>
        </CardBody>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader title="Socials & Links" icon={<IconSettings size={18} />} />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="discordInvite">Discord invite URL</label>
              <input id="discordInvite" name="discordInvite" className="input" defaultValue={v("discordInvite")} />
            </div>
            <div>
              <label className="field-label" htmlFor="vrchatGroupUrl">VRChat group URL</label>
              <input id="vrchatGroupUrl" name="vrchatGroupUrl" className="input" defaultValue={v("vrchatGroupUrl")} />
            </div>
            <div>
              <label className="field-label" htmlFor="socialDiscord">Discord (social link)</label>
              <input id="socialDiscord" name="socialDiscord" className="input" defaultValue={v("socialDiscord")} />
            </div>
            <div>
              <label className="field-label" htmlFor="socialTwitter">Twitter / X</label>
              <input id="socialTwitter" name="socialTwitter" className="input" defaultValue={v("socialTwitter")} />
            </div>
            <div>
              <label className="field-label" htmlFor="socialInstagram">Instagram</label>
              <input id="socialInstagram" name="socialInstagram" className="input" defaultValue={v("socialInstagram")} />
            </div>
            <div>
              <label className="field-label" htmlFor="socialTiktok">TikTok</label>
              <input id="socialTiktok" name="socialTiktok" className="input" defaultValue={v("socialTiktok")} />
            </div>
            <div>
              <label className="field-label" htmlFor="socialYoutube">YouTube</label>
              <input id="socialYoutube" name="socialYoutube" className="input" defaultValue={v("socialYoutube")} />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">Save settings</button>
      </div>
    </form>
  );
}
