import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/Container";
import { Alert, Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { checkMemoryRateLimit, hashIp } from "@/lib/request-security";
import {
  IconArrowLeft,
  IconClock,
  IconFlag,
  IconInbox,
  IconShield,
  IconUsers,
} from "@/components/admin/ui/icons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Track a Request",
  description:
    "Check the status of your submitted support request or report using your reference code.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const LOOKUP_LIMIT = { MAX_PER_WINDOW: 10, WINDOW_MS: 60_000 };

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "OPEN": return "Open";
    case "IN_REVIEW": return "In Review";
    case "WAITING_INFO": return "Waiting for Information";
    case "ACTION_TAKEN": return "Action Taken";
    case "RESOLVED": return "Resolved";
    case "DISMISSED": return "Dismissed";
    case "ESCALATED": return "Escalated";
    case "CLOSED": return "Closed";
    default: return status;
  }
}

function getStatusTone(status: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  switch (status) {
    case "OPEN": return "brand";
    case "IN_REVIEW": return "warning";
    case "WAITING_INFO": return "warning";
    case "ACTION_TAKEN": return "success";
    case "RESOLVED": return "success";
    case "DISMISSED": return "neutral";
    case "ESCALATED": return "danger";
    case "CLOSED": return "danger";
    default: return "neutral";
  }
}

function statusExplanation(status: string, type: "report" | "support"): string {
  switch (status) {
    case "OPEN":
      return type === "report"
        ? "Your report has been received and is waiting to be picked up by the moderation team."
        : "Your support request has been received and is waiting to be picked up by our team.";
    case "IN_REVIEW":
      return "A team member is actively reviewing your submission.";
    case "WAITING_INFO":
      return "We need more information from you before we can proceed. Please check the contact method you provided for messages from our team.";
    case "ACTION_TAKEN":
      return "Action has been taken on your submission.";
    case "RESOLVED":
      return "Your submission has been resolved and is now closed.";
    case "DISMISSED":
      return "Your submission was reviewed and dismissed. No further action will be taken.";
    case "ESCALATED":
      return "Your submission has been escalated to a senior team member due to urgency.";
    case "CLOSED":
      return "Your support ticket has been closed.";
    default:
      return "Your submission has been received by our team.";
  }
}

function nextSteps(status: string, type: "report" | "support"): string[] {
  const closed = ["RESOLVED", "DISMISSED", "CLOSED"].includes(status);
  if (closed) {
    return [
      "If you have new information or need further help, you can submit a new request.",
    ];
  }
  if (status === "WAITING_INFO") {
    return [
      "Check your email or Discord for messages from our team.",
      "Reply with the requested information to keep your request moving.",
    ];
  }
  if (["IN_REVIEW", "ACTION_TAKEN", "ESCALATED"].includes(status)) {
    return [
      "Please be patient while our team reviews your submission.",
      "We will contact you using the details you provided if we need more information.",
    ];
  }
  return [
    "Your submission is in our queue. We will contact you if we need more information.",
  ];
}

type SupportLookup = {
  kind: "support";
  ticketNumber: string;
  status: string;
  updatedAt: Date;
  category: string;
  subject: string;
  createdAt: Date;
};

type ReportLookup = {
  kind: "report";
  reference: string;
  status: string;
  updatedAt: Date;
  category: string;
  description: string;
  createdAt: Date;
};

type LookupResult = SupportLookup | ReportLookup | null;

async function performLookup(code: string): Promise<LookupResult> {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const ticket = await prisma.supportRequest.findUnique({
    where: { ticketNumber: trimmed },
    select: {
      ticketNumber: true,
      status: true,
      category: true,
      subject: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (ticket) {
    return {
      kind: "support",
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      updatedAt: ticket.updatedAt,
      category: ticket.category,
      subject: ticket.subject,
      createdAt: ticket.createdAt,
    };
  }

  const report = await prisma.report.findUnique({
    where: { reference: trimmed },
    select: {
      reference: true,
      id: true,
      status: true,
      reason: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (report) {
    return {
      kind: "report",
      reference: report.reference ?? `UGN-${report.id.slice(0, 6)}`,
      status: report.status,
      updatedAt: report.updatedAt,
      category: report.reason,
      description: report.description,
      createdAt: report.createdAt,
    };
  }

  return null;
}

export default async function SupportTrackerPage({
  searchParams,
}: {
  searchParams?: { code?: string };
}) {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const ipHash = hashIp(ip);
  const rateLimit = checkMemoryRateLimit(
    `support-tracker-lookup:${ipHash}`,
    LOOKUP_LIMIT.MAX_PER_WINDOW,
    LOOKUP_LIMIT.WINDOW_MS,
  );

  const code = searchParams?.code?.trim() || "";

  let result: LookupResult = null;
  let error: string | null = null;

  if (code) {
    if (!rateLimit.allowed) {
      error = "Too many lookups. Please wait a moment and try again.";
    } else {
      try {
        result = await performLookup(code);
      } catch {
        error = "Unable to look up your code right now. Please try again later.";
      }
    }
  }

  return (
    <>
      <PageHeader
        title="Track a Request"
        description="Enter your reference code to check the status of your support request or report."
      />
      <Container className="max-w-2xl py-12 sm:py-16">
        {!rateLimit.allowed && code && (
          <Alert tone="warning" title="Too many lookups" className="mb-6">
            You have made too many lookup attempts. Please wait a moment and try again.
          </Alert>
        )}

        <Card className="animate-fade-in">
          <CardHeader title="Lookup" icon={<IconShield size={18} />} />
          <form action="?code=" method="get" className="space-y-4">
            <div>
              <label htmlFor="tracker-code" className="block text-sm font-semibold text-ink-900 dark:text-white">
                Reference code
              </label>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                Enter the code you received after submitting (for example UGN-000123 or UGN-2026-12345).
              </p>
              <input
                id="tracker-code"
                name="code"
                defaultValue={code}
                placeholder="UGN-000123"
                className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
              />
            </div>
            <Button type="submit" disabled={!rateLimit.allowed} className="w-full sm:w-auto">
              Check status
            </Button>
          </form>

          {code && !result && error === null && (
            <Alert tone="danger" title="Not found" className="mt-6">
              We could not find a report or support request matching that code. Please check the
              code and try again.
            </Alert>
          )}
          {error && (
            <Alert tone="danger" title="Lookup failed" className="mt-6">
              {error}
            </Alert>
          )}

          {result && (
            <Card className="mt-6 space-y-4">
              <CardHeader title="Status" icon={<IconFlag size={18} />} />
              <CardBody className="p-0">
                <div className="px-5 py-4 border-b border-ink-100 dark:border-ink-800">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge tone={getStatusTone(result.status)}>
                      {getStatusLabel(result.status)}
                    </Badge>
                    <span className="text-sm text-ink-500 dark:text-ink-400">
                      <span className="font-mono font-semibold text-ink-800 dark:text-ink-100">
                        {result.kind === "support" ? result.ticketNumber : result.reference}
                      </span>
                    </span>
                  </div>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <IconClock size={14} /> Submitted
                      </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                        {formatDateTime(result.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <IconClock size={14} /> Last Updated
                      </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                        {formatDateTime(result.updatedAt)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                        <IconInbox size={14} /> Category
                      </dt>
                      <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100">
                        {result.kind === "support" ? result.category : result.category.replace(/_/g, " ")}
                      </dd>
                    </div>
                    {result.kind === "support" && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                          <IconUsers size={14} /> Subject
                        </dt>
                        <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100 truncate">
                          {result.subject}
                        </dd>
                      </div>
                    )}
                    {result.kind === "report" && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-ink-500 dark:text-ink-400 flex items-center gap-1">
                          <IconUsers size={14} /> Details
                        </dt>
                        <dd className="mt-1 text-sm text-ink-800 dark:text-ink-100 line-clamp-2">
                          {result.description}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="px-5 py-4">
                  <h3 className="mb-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
                    What this means
                  </h3>
                  <p className="text-sm text-ink-700 dark:text-ink-200 mb-3">
                    {statusExplanation(result.status, result.kind)}
                  </p>
                  <h4 className="mb-1 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                    Next steps
                  </h4>
                  <ul className="list-disc list-inside text-sm text-ink-600 dark:text-ink-400 space-y-1">
                    {nextSteps(result.status, result.kind).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="px-5 py-4 border-t border-ink-100 dark:border-ink-800 text-xs text-ink-500 dark:text-ink-400">
                  <p>
                    This page shows only the status of your submission. Internal moderation notes,
                    staff identities, and contact details are not displayed here.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </Card>

        <div className="mt-8 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
          <IconArrowLeft size={16} aria-hidden />
          <Link href="/">Back to the site</Link>
        </div>
      </Container>
    </>
  );
}
