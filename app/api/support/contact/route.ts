import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";

const VALID_CATEGORIES = [
  "Bug Report",
  "Technical Problem",
  "Feature Request",
  "General Question",
  "Community / Discord",
  "Moderation / Safety",
  "Moderation Appeal",
  "Harassment / Report",
  "Report Content",
  "Account / Discord Issue",
  "Shop / Purchase",
  "Creator Support",
  "Content / Resources",
  "Feedback / Suggestions",
  "Partnership / Collaboration",
  "Privacy / Data Request",
  "Report a Website Issue",
  "Other",
];

const VALID_CONTACT_METHODS = ["discord", "email", "other"];

function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000; // 5 digits
  return `UGN-${year}-${random}`;
}

export async function POST(req: Request) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const category = String(payload.category || "").trim();
  const subject = String(payload.subject || "").trim();
  const description = String(payload.description || "").trim();
  const contactMethod = String(payload.contactMethod || "").trim();
  const contactInfo = String(payload.contactInfo || "").trim();

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { success: false, error: "Invalid category." },
      { status: 400 },
    );
  }

  if (!VALID_CONTACT_METHODS.includes(contactMethod)) {
    return NextResponse.json(
      { success: false, error: "Invalid contact method." },
      { status: 400 },
    );
  }

  if (!subject || subject.length > 120) {
    return NextResponse.json(
      { success: false, error: "Subject required (max 120 chars)." },
      { status: 400 },
    );
  }

  if (!description || description.length > 3000) {
    return NextResponse.json(
      { success: false, error: "Description required (max 3000 chars)." },
      { status: 400 },
    );
  }

  if (!contactInfo || contactInfo.length > 200) {
    return NextResponse.json(
      { success: false, error: "Contact information required (max 200 chars)." },
      { status: 400 },
    );
  }

  let ticketNumber: string;
  let attempts = 0;
  do {
    ticketNumber = generateTicketNumber();
    const existing = await prisma.supportRequest.findUnique({
      where: { ticketNumber },
      select: { id: true },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    return NextResponse.json(
      { success: false, error: "Could not generate unique ticket number. Please try again." },
      { status: 500 },
    );
  }

  try {
    const created = await prisma.supportRequest.create({
      data: {
        ticketNumber: ticketNumber!,
        category,
        subject,
        description,
        contactMethod,
        contactInfo,
        status: "OPEN",
        priority: "NORMAL",
        attachments: "[]",
      },
      select: { ticketNumber: true },
    });

    // Optional: Discord notification for staff
    try {
      const webhookUrl = (await getSetting("discordReportsWebhookUrl")).trim();
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `📬 **New support ticket: ${created.ticketNumber}**`,
            embeds: [{
              title: subject,
              description: description.slice(0, 4000),
              color: 0x750787,
              fields: [
                { name: "Category", value: category, inline: true },
                { name: "Contact", value: `${contactMethod}: ${contactInfo}`, inline: true },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "Ur Gay Now Support" },
            }],
          }),
        });
      }
    } catch {
      // Don't fail if notification fails
    }

    return NextResponse.json({ success: true, ticketNumber: created.ticketNumber });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[support/contact] failure", { message });
    return NextResponse.json(
      { success: false, error: "Could not submit request. Please try again." },
      { status: 500 },
    );
  }
}