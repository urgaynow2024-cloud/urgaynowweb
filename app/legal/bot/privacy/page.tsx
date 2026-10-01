import type { Metadata } from "next";
import { LegalBackLinks, LegalCallout, LegalDocument } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "1 October 2026";

export const metadata: Metadata = {
  title: "Bot Privacy Policy",
  description:
    "What data the Ur Gay Now bot and website store, why we store it, how long we keep it, who we share it with, and how to ask for it.",
  alternates: { canonical: "/legal/bot/privacy" },
};

export default function BotPrivacyPage() {
  return (
    <LegalDocument
      footer={<LegalBackLinks />}
      title="Bot Privacy Policy"
      summary="What we actually collect, why we collect it, and what we do not do with it."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "overview",
          title: "1. Overview",
          body: (
            <>
              <p>
                Ur Gay Now is a volunteer-run LGBTQ+ community on Discord and VRChat. This policy
                explains the personal data our Discord bot and this website process, why we need it,
                and what we do with it. It is written to match what the software actually does — if
                the implementation changes, this page is updated.
              </p>
              <p>
                The short version: we collect the minimum needed to moderate the community and to
                handle reports. We do not sell your data, and we do not use it for marketing.
              </p>
            </>
          ),
        },
        {
          id: "information-we-process",
          title: "2. Information We Process",
          body: (
            <>
              <h3>From the Discord bot</h3>
              <ul>
                <li>Your Discord user ID, so the bot can recognise you and apply moderation.</li>
                <li>The Discord server ID of the UGN server.</li>
                <li>
                  Role information, including role IDs and names, used to decide which commands you
                  can run.
                </li>
                <li>
                  Records of moderation actions, such as who was timed out by whom and why. These
                  exist so staff can review decisions.
                </li>
              </ul>

              <h3>From this website</h3>
              <ul>
                <li>
                  <strong>Reports you submit:</strong> the category, your description, the reported
                  person&rsquo;s name or Discord ID if you provide it, the incident date if you
                  provide it, any links you add, any evidence files you attach, and whether you chose
                  to submit anonymously.
                </li>
                <li>
                  <strong>Optional contact details:</strong> your name and email address, only if you
                  provide them and do not submit anonymously.
                </li>
                <li>
                  <strong>Technical data used for abuse prevention:</strong> a salted, one-way hash
                  of the IP address a request came from. The raw IP address is not stored in the
                  database. The hash is used to rate-limit submissions and to spot duplicate
                  reports, and it is not used for anything else.
                </li>
                <li>
                  <strong>Cookies:</strong> an httpOnly cookie that remembers which reports your
                  browser submitted so you can track them, and a staff session cookie for
                  administrators.
                </li>
                <li>
                  <strong>Support messages:</strong> if you contact us through the support form, the
                  details you type plus a generated ticket reference.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "why-we-process-it",
          title: "3. Why We Process It",
          body: (
            <ul>
              <li>To investigate reports and keep an accurate moderation record.</li>
              <li>To apply and record moderation actions in Discord.</li>
              <li>To prevent spam, abuse, and duplicate submissions.</li>
              <li>To let you follow the status of a report you submitted.</li>
              <li>To answer support requests.</li>
            </ul>
          ),
        },
        {
          id: "discord-information",
          title: "4. Discord Information",
          body: (
            <p>
              The bot only collects Discord data for members of the UGN server, and only the data
              needed to run its commands. We do not read, store, or forward the content of your
              messages. If a moderation command logs a message reference (such as a deleted message
              ID), that record exists only for staff review.
            </p>
          ),
        },
        {
          id: "moderation-and-report-information",
          title: "5. Moderation and Report Information",
          body: (
            <>
              <p>Reports are confidential. Specifically:</p>
              <ul>
                <li>Only authorised UGN staff can open a report.</li>
                <li>
                  Evidence files you attach have no public URL. They can only be opened through an
                  authenticated staff route, and every time a staff member opens one it is written
                  to the report&rsquo;s audit trail.
                </li>
                <li>
                  Internal staff notes are never shown to the person who submitted the report, and
                  never posted to Discord.
                </li>
                <li>
                  Our staff notification webhook receives only the report reference, category,
                  priority, whether a target was named, how many files and links were attached, and
                  a private link to the dashboard. It does not receive your description, your
                  contact details, or your uploaded files.
                </li>
                <li>
                  Anonymous reports do not store your name or email, and staff cannot see who sent
                  them. Anonymous does not mean technically untraceable: our hosting and security
                  providers may keep their own technical logs.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "logs-and-technical-data",
          title: "6. Logs and Technical Data",
          body: (
            <p>
              Our hosting provider records standard request logs (such as IP address, timestamp,
              and requested URL) for security and availability purposes. Those logs are controlled by
              the provider under its own policy and are not used by UGN for marketing. Staff actions
              inside the admin console are recorded in our own audit logs.
            </p>
          ),
        },
        {
          id: "data-sharing",
          title: "7. Data Sharing",
          body: (
            <>
              <p>
                We share data only with the service providers needed to run the community, and only to
                do their job:
              </p>
              <ul>
                <li>
                  <strong>Hosting and deployment:</strong> the provider that serves this website.
                </li>
                <li>
                  <strong>Database provider:</strong> stores the community content, staff list, and
                  reports.
                </li>
                <li>
                  <strong>Image storage provider:</strong> stores images uploaded for community
                  photos, gallery submissions, and similar site content. Report evidence is
                  <em> not</em> stored with them — it is kept in the database so it cannot be
                  shared by URL.
                </li>
                <li>
                  <strong>Discord:</strong> for anything the bot does inside Discord.
                </li>
              </ul>
              <p>
                We do not sell data, share it for advertising, or hand it to law enforcement except
                where the law requires it. If we are ever legally compelled to disclose a report, we
                will tell the affected person unless we are not allowed to.
              </p>
            </>
          ),
        },
        {
          id: "data-retention",
          title: "8. Data Retention",
          body: (
            <>
              <ul>
                <li>
                  <strong>Reports</strong> are kept as moderation records. Resolved and dismissed
                  reports are not automatically deleted; they remain available to authorised staff
                  for the audit history and are removed only if a staff member deletes them or you
                  ask us to.
                </li>
                <li>
                  <strong>Report resolution data</strong> (outcome text and the staff member who
                  closed it) is kept with the report.
                </li>
                <li>
                  <strong>Evidence uploads</strong> that are never attached to a report are deleted
                  automatically after 24 hours.
                </li>
                <li>
                  <strong>Rate-limit data</strong> (the hashed IP) is kept with the report so
                  duplicate-submission checks keep working.
                </li>
                <li>
                  <strong>Tracking cookies</strong> keep the list of reports your browser submitted
                  for up to 180 days. Clearing cookies means you will need your private tracking
                  link instead.
                </li>
                <li>
                  <strong>Support messages</strong> are kept as long as they are useful for support
                  and moderation.
                </li>
              </ul>
              <LegalCallout>
                There is currently no automated job that deletes closed reports on a timer. If you
                want a report or its evidence removed, ask us and we will do it.
              </LegalCallout>
            </>
          ),
        },
        {
          id: "data-security",
          title: "9. Data Security",
          body: (
            <ul>
              <li>Report and admin data is only served to authenticated staff, checked on the server.</li>
              <li>Session and tracking cookies are httpOnly and marked secure in production.</li>
              <li>Secrets such as our Discord webhook URL are stored only in server-side environment variables, never in browser code or public API responses.</li>
              <li>Evidence files are type-checked, size-limited, and stored without a public URL.</li>
              <li>Report submissions are rate-limited and validated on the server.</li>
              <li>Administrative actions are recorded in an audit trail.</li>
            </ul>
          ),
        },
        {
          id: "user-requests",
          title: "10. User Requests",
          body: (
            <>
              <p>
                You can ask to see, correct, or delete the personal data connected to a report you
                submitted. Contact staff in Discord or through the{" "}
                <a href="/support">support page</a>, and include:
              </p>
              <ul>
                <li>Your report reference, for example <code>UGN-000123</code>, or</li>
                <li>Your private tracking link, which is the most reliable way for us to find it.</li>
              </ul>
              <p>
                We may ask you to confirm the request before we act on it. We will always try to
                respond, and we will explain if we cannot delete something — for example, because
                it is part of a moderation record we are required to keep.
              </p>
            </>
          ),
        },
        {
          id: "childrens-privacy",
          title: "11. Children's Privacy",
          body: (
            <p>
              This service is not directed at children under 13, and Discord requires members of our
              server to meet its minimum age requirement. We do not knowingly collect personal data
              from children below that age. If you believe a child has submitted a report or created
              an account in our spaces, tell us and we will deal with it under our safeguarding
              process.
            </p>
          ),
        },
        {
          id: "third-party-services",
          title: "12. Third-Party Services",
          body: (
            <p>
              We use Discord, VRChat, and hosting, database, and storage providers. Their own terms
              and privacy policies also apply to you when you use those services. We do not
              control them, and we are not responsible for how they handle data outside the parts
              they process for us.
            </p>
          ),
        },
        {
          id: "changes",
          title: "13. Changes to This Policy",
          body: (
            <p>
              If our data practices change, this page is updated and the &ldquo;last updated&rdquo;
              date changes. We will not retroactively weaken a commitment that has already been made
              about reports you have submitted.
            </p>
          ),
        },
        {
          id: "contact",
          title: "14. Contact",
          body: (
            <p>
              Privacy questions and requests can be sent to UGN staff in Discord or through the{" "}
              <a href="/support">support page</a>. Please include a report reference if your question
              is about a specific report.
            </p>
          ),
        },
      ]}
    />
  );
}