import type { Metadata } from "next";
import { LegalBackLinks, LegalCallout, LegalDocument } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "1 October 2026";

export const metadata: Metadata = {
  title: "Bot Terms of Service",
  description:
    "Terms of service for the Ur Gay Now Discord bot: what it does, who can use it, acceptable use, moderation features, and liability.",
  alternates: { canonical: "/legal/bot/terms" },
};

export default function BotTermsPage() {
  return (
    <LegalDocument
      footer={<LegalBackLinks />}
      title="Bot Terms of Service"
      summary="The plain-English rules for using the Ur Gay Now Discord bot and the staff tools built on it."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "introduction",
          title: "1. Introduction",
          body: (
            <>
              <p>
                These terms cover the Ur Gay Now Discord bot (the &ldquo;bot&rdquo;) and the staff
                tools that run alongside it, including the report system on this website. Ur Gay
                Now (referred to as &ldquo;UGN&rdquo;, &ldquo;we&rdquo;, or &ldquo;us&rdquo;) is a
                volunteer-run community. By adding the bot to our Discord server, using one of its
                commands, or moderating through our tools, you agree to these terms.
              </p>
              <p>
                These terms are written to be read. Where our community rules are stricter than
                anything here, the community rules win. Where Discord&rsquo;s own rules apply, they
                win over both.
              </p>
            </>
          ),
        },
        {
          id: "what-the-bot-does",
          title: "2. What the Bot Does",
          body: (
            <>
              <p>The bot currently supports:</p>
              <ul>
                <li>Moderation commands used by UGN staff, such as timeouts, kicks, and bans.</li>
                <li>
                  Role and permission management for staff, including temporary moderation roles.
                </li>
                <li>Announcements and event notices posted to our Discord channels.</li>
                <li>Logging of moderation actions so staff can review what happened.</li>
                <li>
                  Links to the UGN website, including the report system that staff use to triage
                  community reports.
                </li>
              </ul>
              <p>
                The bot is provided for UGN community use. It is not a general-purpose bot, a
                customer support tool for other projects, or a service for other servers.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "3. Eligibility and Use",
          body: (
            <>
              <p>
                Discord itself requires members of our server to be at least 13 years old, or the
                minimum age required in their country. By participating you confirm that you meet
                that requirement, and that using the bot is allowed where you live.
              </p>
              <p>
                Staff roles are only given to people who have agreed to the staff responsibilities
                described in our community rules. Being a member of the server does not give you
                access to staff commands.
              </p>
            </>
          ),
        },
        {
          id: "authorized-server",
          title: "4. Authorized Server",
          body: (
            <>
              <p>
                The bot is configured for the Ur Gay Now Discord server only. If you operate another
                Discord server and would like the bot added there, please contact staff first: we
                will not add it without an explicit, documented request from a server owner.
              </p>
              <p>
                Attempting to invite the bot to an unauthorised server, or to use bot features in a
                way that interferes with the UGN server, may result in your account being blocked
                from the UGN server and from the bot.
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "5. Acceptable Use",
          body: (
            <ul>
              <li>Use the bot as part of normal moderation of the UGN community.</li>
              <li>
                Follow the Discord Community Guidelines and the UGN community rules at all times.
              </li>
              <li>
                Only act on accounts and content you are authorised to act on, and record why you
                took an action.
              </li>
              <li>Ask a lead moderator before taking an action that is hard to undo.</li>
            </ul>
          ),
        },
        {
          id: "prohibited-use",
          title: "6. Prohibited Use",
          body: (
            <ul>
              <li>Spamming commands, automating requests, or deliberately overloading the bot.</li>
              <li>
                Attempting to reverse engineer, decompile, scrape, or interfere with the bot or this
                website, including bypassing rate limits or permission checks.
              </li>
              <li>
                Attempting to access reports, evidence, or staff tools that you are not authorised
                to view, including by guessing identifiers or modifying URLs.
              </li>
              <li>
                Removing, altering, or republishing UGN attribution or ownership notices without
                permission.
              </li>
              <li>Using the bot or these tools to harass, threaten, or dox anyone.</li>
            </ul>
          ),
        },
        {
          id: "moderation-and-staff-features",
          title: "7. Moderation and Staff Features",
          body: (
            <>
              <p>
                Staff features are privileged. They can time out, kick, ban, and change roles. Using
                them incorrectly affects real people, so:
              </p>
              <ul>
                <li>
                  Every action should be logged with a short reason. The bot and the staff report
                  dashboard keep an audit trail for this purpose.
                </li>
                <li>
                  Report contents, uploaded evidence, and internal staff notes are confidential.
                  They must not be screenshotted, forwarded, or shared outside the staff team.
                </li>
                <li>
                  Safeguarding-related reports must only be handled by safeguarding staff or a lead.
                </li>
              </ul>
              <p>
                Staff who misuse these features can have their roles removed, including by a
                decision of the founder or co-founders.
              </p>
            </>
          ),
        },
        {
          id: "reports-and-submissions",
          title: "8. Reports and User Submissions",
          body: (
            <>
              <p>
                Anyone can submit a report through this website without an account, optionally
                staying anonymous. When you submit a report you agree that:
              </p>
              <ul>
                <li>
                  <strong>Your report is private.</strong> It is visible only to authorised UGN
                  moderation staff. It is never published, and it is not posted to Discord.
                </li>
                <li>
                  <strong>Do not submit false reports.</strong> Knowingly false or malicious reports
                  may lead to your account being restricted.
                </li>
                <li>
                  <strong>Do not put other people&rsquo;s private data in a report unless it is
                  genuinely relevant.</strong> Personal information is redacted from staff notes
                  where possible.
                </li>
                <li>
                  <strong>You keep your rights.</strong> You can ask us to delete a report you
                  submitted; see the{" "}
                  <a href="/legal/bot/privacy">Bot Privacy Policy</a>.
                </li>
              </ul>
              <LegalCallout>
                Evidence files you attach are stored privately with no public URL. Only staff with
                evidence access can open them, and every time they do, it is recorded.
              </LegalCallout>
            </>
          ),
        },
        {
          id: "discord-and-third-parties",
          title: "9. Discord and Third-Party Services",
          body: (
            <>
              <p>
                The bot runs on Discord and this website runs on third-party infrastructure. By
                using either, you also agree to:
              </p>
              <ul>
                <li>Discord&rsquo;s Terms of Service and Community Guidelines.</li>
                <li>
                  The policies of our hosting, database, and storage providers, which process data
                  only to deliver the service.
                </li>
                <li>
                  VRChat&rsquo;s Terms of Service, when the community you are reporting about is on
                  VRChat.
                </li>
              </ul>
              <p>
                UGN does not control those services. We cannot guarantee their uptime, availability,
                or behaviour.
              </p>
            </>
          ),
        },
        {
          id: "availability-and-changes",
          title: "10. Availability and Changes",
          body: (
            <p>
              The bot and this website are provided by volunteers and are offered{" "}
              <strong>as is</strong>. Features may be added, changed, or removed, and the service
              may be unavailable for maintenance or because of events outside our control. We aim to
              keep moderation tooling available, but we do not offer an uptime guarantee.
            </p>
          ),
        },
        {
          id: "suspension-or-removal",
          title: "11. Suspension or Removal",
          body: (
            <>
              <p>
                We may suspend or remove access to the bot, staff tools, or the website for anyone
                who breaches these terms or the community rules, or who is found to be abusing the
                report system. Where someone is actively causing harm, action may be taken without
                prior warning.
              </p>
              <p>
                If you think a moderation decision about you was wrong, ask a lead moderator or the
                founder to review it. Reviews are handled by someone who was not involved in the
                original decision wherever possible.
              </p>
            </>
          ),
        },
        {
          id: "intellectual-property",
          title: "12. Intellectual Property",
          body: (
            <p>
              UGN branding, the bot, this website, and UGN-specific moderation tooling are owned by
              Ur Gay Now under the agreements described in the{" "}
              <a href="/legal/ownership">UGN Ownership &amp; IP</a> page. Personal work that a member
              created before or outside a UGN engagement stays with its creator. Third-party and
              open-source licences continue to apply.
            </p>
          ),
        },
        {
          id: "disclaimers",
          title: "13. Disclaimers",
          body: (
            <p>
              The bot and this website are provided for community moderation and enjoyment. We do
              not warrant that they will be error-free, uninterrupted, or that any moderation outcome
              will satisfy everyone involved. Moderation decisions are made by people and can be
              reviewed, but they are not a legal process.
            </p>
          ),
        },
        {
          id: "liability",
          title: "14. Limitation of Liability",
          body: (
            <>
              <p>
                To the fullest extent allowed by law, Ur Gay Now, its volunteers, and its
                contributors are not liable for indirect or consequential loss arising from your use
                of the bot, this website, or any community space, including loss of data, lost
                opportunities, or lost profits.
              </p>
              <p>
                Nothing in these terms limits liability that cannot legally be limited, including
                liability for fraud, or for anything a volunteer is responsible for under the laws
                that apply to them.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "15. Changes to These Terms",
          body: (
            <p>
              We may update these terms when the bot, the website, or the law changes. The
              &ldquo;last updated&rdquo; date at the top of this page always reflects the current
              version. Continuing to use the bot after a change means you accept the updated terms.
            </p>
          ),
        },
        {
          id: "contact",
          title: "16. Contact",
          body: (
            <p>
              Questions about these terms can be raised with UGN staff in Discord, through the{" "}
              <a href="/support">support page</a>, or by submitting a report on this site. If your
              question is about a specific report, include its reference (for example{" "}
              <code>UGN-000123</code>).
            </p>
          ),
        },
      ]}
    />
  );
}