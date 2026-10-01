import type { Metadata } from "next";
import { LegalBackLinks, LegalCallout, LegalDocument } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "1 October 2026";

export const metadata: Metadata = {
  title: "UGN Ownership & IP",
  description:
    "Which work Ur Gay Now owns, what stays with the person who made it, and how third-party licences are respected.",
  alternates: { canonical: "/legal/ownership" },
};

export default function OwnershipPage() {
  return (
    <LegalDocument
      footer={<LegalBackLinks />}
      title="UGN Ownership & Intellectual Property"
      summary="What UGN owns, what stays with its creator, and how we handle licences."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "purpose",
          title: "1. Purpose",
          body: (
            <p>
              Ur Gay Now is built by volunteers, commissioned creators, and paid contractors. This
              page exists so everyone involved — and everyone who finds our work online — can be
              clear about who owns what, and why.
            </p>
          ),
        },
        {
          id: "what-ugsn-owns",
          title: "2. Work Assigned to UGN",
          body: (
            <>
              <p>
                Work created specifically for Ur Gay Now as part of an official UGN project, a
                commission, an employment or volunteer arrangement, or another documented UGN
                engagement is owned by Ur Gay Now to the extent that the applicable agreement says
                so. Where a signed agreement, commission brief, contract, or written assignment
                transfers ownership to UGN, that work is UGN-owned as specified by that agreement.
              </p>
              <p>UGN-specific materials may include, where applicable:</p>
              <ul>
                <li>UGN branding and UGN logos.</li>
                <li>The UGN website and its source code.</li>
                <li>UGN-specific user interface and design work.</li>
                <li>UGN documentation.</li>
                <li>The UGN Discord bot, its code, and its configuration.</li>
                <li>UGN moderation systems and staff tools.</li>
                <li>UGN-specific marketing and event materials.</li>
                <li>Assets commissioned and delivered for UGN under a documented agreement.</li>
                <li>
                  The official UGN seasonal icon, which is used unaltered as supplied by UGN.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "what-stays-with-creators",
          title: "3. What Stays With the Creator",
          body: (
            <>
              <LegalCallout>
                <strong>
                  Merely being a member, staff member, volunteer, or supporter of UGN does not
                  transfer ownership of your work to UGN.
                </strong>{" "}
                We do not claim unrelated personal work or work you created before a UGN engagement.
              </LegalCallout>
              <p>The following stays with the person who made it:</p>
              <ul>
                <li>
                  Art, writing, music, code, and other work you created independently of a UGN
                  engagement.
                </li>
                <li>
                  Work created before you joined UGN, or created for another project, client, or
                  community.
                </li>
                <li>
                  Portfolio and personal projects you mention or link to, unless a specific UGN
                  agreement covers them.
                </li>
                <li>
                  Your name, likeness, and personal branding, unless you have agreed otherwise in
                  writing for a specific UGN use.
                </li>
              </ul>
              <p>
                Where ownership of a UGN-specific asset is genuinely unclear, ask before you reuse it.
                We would rather answer a question than argue about it later.
              </p>
            </>
          ),
        },
        {
          id: "how-ugsn-uses-work",
          title: "4. How UGN Uses Work It Owns",
          body: (
            <p>
              Ur Gay Now may use, host, display, adapt, and distribute work it owns to run the
              community: on this website, in Discord, at events, and in promotional material. Where
              an agreement limits how work may be used, we follow it. Where a creator asked to be
              credited, we credit them.
            </p>
          ),
        },
        {
          id: "third-party-licences",
          title: "5. Third-Party and Open-Source Licences",
          body: (
            <>
              <p>
                UGN work is built on open-source and third-party assets. Those licences — and any
                asset licences attached to community submissions — continue to apply and are not
                changed by UGN ownership.
              </p>
              <ul>
                <li>
                  <strong>Open-source dependencies</strong> (for example Next.js, React, Tailwind
                  CSS, Prisma) remain under their own licences.
                </li>
                <li>
                  <strong>Community-submitted photos and designs</strong> remain the property of the
                  people who made them, and are published with their permission.
                </li>
                <li>
                  <strong>Music and media</strong> used at events or shared in community spaces may
                  belong to third parties and are used accordingly.
                </li>
                <li>
                  <strong>Fonts and icon sets</strong> remain under their own licences.
                </li>
              </ul>
              <p>
                If you believe UGN is using your work in a way that breaches its licence or your
                rights, contact us and we will take it down while we look into it.
              </p>
            </>
          ),
        },
        {
          id: "reporting-concerns",
          title: "6. Reporting a Concern",
          body: (
            <p>
              Copyright or ownership concerns about UGN material should include a link to the material,
              a description of your rights, and how we can contact you. Submit it through the{" "}
              <a href="/report">report form</a> using the &ldquo;Other&rdquo; category, or contact
              staff directly. Ownership reports are read by leads rather than the general queue.
            </p>
          ),
        },
        {
          id: "changes",
          title: "7. Changes to This Page",
          body: (
            <p>
              This page can change when UGN agreements change or when new types of UGN work are
              created. The &ldquo;last updated&rdquo; date reflects the current version.
            </p>
          ),
        },
      ]}
    />
  );
}