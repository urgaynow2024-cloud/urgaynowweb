"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui";
import { PUBLIC_CATEGORY_OPTIONS } from "@/lib/report-validation";
import { REPORT_LIMITS, formatReportBytes } from "@/lib/reports";
import { IconAlert, IconCheck, IconShield, IconTrash } from "@/components/admin/ui/icons";

type Attachment = {
  id: string;
  fileName: string;
  size: number;
  contentType: string;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | {
      status: "success";
      reference: string;
      trackingUrl: string | null;
      notification: string;
      duplicate: boolean;
    };

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Array.from({ length: 24 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)],
  ).join("");
}

export function PublicReportForm() {
  const [category, setCategory] = useState("");
  const [reportedPerson, setReportedPerson] = useState("");
  const [reportedDiscord, setReportedDiscord] = useState("");
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [incidentAt, setIncidentAt] = useState("");
  const [links, setLinks] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [website, setWebsite] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const idempotencyKey = useRef(newIdempotencyKey());
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedCategory = useMemo(
    () => PUBLIC_CATEGORY_OPTIONS.find((option) => option.value === category),
    [category],
  );

  const attachmentBytes = useMemo(
    () => attachments.reduce((total, file) => total + file.size, 0),
    [attachments],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadError("");

      const incoming = Array.from(files);
      if (attachments.length + incoming.length > REPORT_LIMITS.EVIDENCE_MAX_FILES) {
        setUploadError(`You can attach up to ${REPORT_LIMITS.EVIDENCE_MAX_FILES} files.`);
        return;
      }

      setUploading(true);
      try {
        for (const file of incoming) {
          if (file.size > REPORT_LIMITS.EVIDENCE_MAX_BYTES) {
            setUploadError(
              `${file.name} is too large (max ${formatReportBytes(REPORT_LIMITS.EVIDENCE_MAX_BYTES)}).`,
            );
            continue;
          }
          if (attachmentBytes + file.size > REPORT_LIMITS.EVIDENCE_MAX_TOTAL_BYTES) {
            setUploadError("That is more than the total attachment limit for one report.");
            continue;
          }

          const body = new FormData();
          body.append("file", file);
          const response = await fetch("/api/report/evidence", { method: "POST", body });
          const data = await response.json().catch(() => ({}));

          if (!response.ok || !data.success) {
            setUploadError(data.error || `${file.name} could not be uploaded.`);
            continue;
          }

          setAttachments((current) => [
            ...current,
            {
              id: data.id,
              fileName: data.fileName,
              size: data.size,
              contentType: data.contentType,
            },
          ]);
        }
      } catch {
        setUploadError("The upload could not be completed. Please try again.");
      } finally {
        setUploading(false);
        if (formRef.current) {
          const input = formRef.current.querySelector<HTMLInputElement>('input[type="file"]');
          if (input) input.value = "";
        }
      }
    },
    [attachments.length, attachmentBytes],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.status === "submitting") return;

    setState({ status: "submitting" });

    const combinedDescription =
      additionalInfo.trim().length > 0
        ? `${description.trim()}\n\nAdditional information:\n${additionalInfo.trim()}`
        : description.trim();

    try {
      const response = await fetch("/api/report/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: combinedDescription,
          reportedPerson,
          reportedDiscord,
          incidentAt: incidentAt || null,
          links,
          reporterName,
          reporterEmail,
          anonymous,
          website,
          idempotencyKey: idempotencyKey.current,
          evidenceIds: attachments.map((file) => file.id),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setState({
          status: "error",
          message: data.error || "We couldn't submit your report. Please try again.",
        });
        return;
      }

      setState({
        status: "success",
        reference: data.reference || "UGN-000000",
        trackingUrl: data.trackingUrl ?? null,
        notification: data.notification ?? "queued",
        duplicate: Boolean(data.duplicate),
      });
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setState({
        status: "error",
        message: "We couldn't submit your report. Please check your connection and try again.",
      });
    }
  };

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="space-y-6 rounded-3xl border border-emerald-300/60 bg-emerald-50/70 p-6 dark:border-emerald-800 dark:bg-emerald-950/30 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden>
            <IconCheck size={26} />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-ink-900 dark:text-white">
              {state.duplicate ? "You already sent this report" : "Report submitted"}
            </h2>
            <p className="mt-2 text-ink-700 dark:text-ink-200">
              Thank you for telling us. Our moderation team reviews every report. Keep this
              reference for your records:
            </p>
            <p className="mt-4 inline-block rounded-xl border border-emerald-400/60 bg-white px-4 py-2 font-mono text-lg font-bold tracking-wide text-emerald-800 dark:bg-ink-900 dark:text-emerald-300">
              {state.reference}
            </p>
          </div>
        </div>

        {state.trackingUrl && (
          <Alert tone="info" title="Follow your report">
            You can check the status of this report any time with your private link:{" "}
            <Link href={state.trackingUrl} className="font-semibold underline">
              view report status
            </Link>
            . The link only works in this browser, so save it if you need it later.
          </Alert>
        )}

        {state.notification === "queued" && (
          <Alert tone="warning" title="Staff notification pending">
            Your report was saved, but our Discord staff notification could not be delivered.
            Staff can still see and action the report from the dashboard, and will retry the
            notification automatically.
          </Alert>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/report/me" className="btn-primary">
            View my reports
          </Link>
          <Link href="/" className="btn-secondary">
            Back to the site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate={false} className="space-y-6">
      {state.status === "error" && (
        <Alert tone="danger" title="Your report was not sent">
          {state.message} Your details are still in the form below — nothing was lost.
        </Alert>
      )}

      {/* Honeypot: hidden from users, never announced to assistive tech. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="report-website">Website</label>
        <input
          id="report-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <fieldset className="space-y-6 rounded-3xl border border-ink-200/80 bg-white/70 p-5 dark:border-ink-800 dark:bg-ink-900/50 sm:p-6">
        <legend className="px-2 text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">
          1. What is this about?
        </legend>

        <div>
          <label htmlFor="report-category" className="field-label">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="report-category"
            name="category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-describedby="report-category-help"
            className="select"
          >
            <option value="">Select a category</option>
            {PUBLIC_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id="report-category-help" className="field-help">
            {selectedCategory?.description ??
              "Choose the option that best matches what happened."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="report-person" className="field-label">
              Reported person
            </label>
            <input
              id="report-person"
              name="reportedPerson"
              type="text"
              maxLength={REPORT_LIMITS.REPORTED_PERSON_MAX}
              value={reportedPerson}
              onChange={(event) => setReportedPerson(event.target.value)}
              placeholder="VRChat or display name"
              className="input"
            />
            <p className="field-help">Leave blank if you are not sure who it was.</p>
          </div>
          <div>
            <label htmlFor="report-discord" className="field-label">
              Discord username or ID
            </label>
            <input
              id="report-discord"
              name="reportedDiscord"
              type="text"
              maxLength={REPORT_LIMITS.REPORTED_DISCORD_MAX}
              value={reportedDiscord}
              onChange={(event) => setReportedDiscord(event.target.value)}
              placeholder="username or 123456789012345678"
              className="input"
            />
            <p className="field-help">Helps us find the person quickly.</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-6 rounded-3xl border border-ink-200/80 bg-white/70 p-5 dark:border-ink-800 dark:bg-ink-900/50 sm:p-6">
        <legend className="px-2 text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">
          2. What happened?
        </legend>

        <div>
          <label htmlFor="report-description" className="field-label">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="report-description"
            name="description"
            required
            rows={7}
            maxLength={REPORT_LIMITS.DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-describedby="report-description-help report-description-count"
            placeholder="Tell the moderation team what happened, where, and anything that identifies the incident."
            className="textarea"
          />
          <div
            id="report-description-help"
            className="mt-1.5 flex flex-wrap justify-between gap-2 text-xs text-ink-500 dark:text-ink-400"
          >
            <span>Minimum {REPORT_LIMITS.DESCRIPTION_MIN} characters. Links and screenshots are fine.</span>
            <span id="report-description-count">
              {description.length}/{REPORT_LIMITS.DESCRIPTION_MAX}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="report-additional" className="field-label">
            Anything else we should know?
          </label>
          <textarea
            id="report-additional"
            name="additionalInfo"
            rows={3}
            maxLength={1500}
            value={additionalInfo}
            onChange={(event) => setAdditionalInfo(event.target.value)}
            aria-describedby="report-additional-help"
            placeholder="Context, previous reports, or anything you were worried about."
            className="textarea"
          />
          <p id="report-additional-help" className="field-help">
            Optional. Added to the description staff see.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="report-incident" className="field-label">
              When did it happen?
            </label>
            <input
              id="report-incident"
              name="incidentAt"
              type="datetime-local"
              value={incidentAt}
              max={new Date().toISOString().slice(0, 16)}
              onChange={(event) => setIncidentAt(event.target.value)}
              aria-describedby="report-incident-help"
              className="input"
            />
            <p id="report-incident-help" className="field-help">
              Optional. Approximate is fine.
            </p>
          </div>
          <div>
            <label htmlFor="report-links" className="field-label">
              Relevant links
            </label>
            <textarea
              id="report-links"
              name="links"
              rows={2}
              value={links}
              onChange={(event) => setLinks(event.target.value)}
              aria-describedby="report-links-help"
              placeholder={"https://discord.com/channels/...\nhttps://vrchat.com/home/..."}
              className="textarea"
            />
            <p id="report-links-help" className="field-help">
              Optional. One https:// link per line, up to {REPORT_LIMITS.LINKS_MAX_COUNT}.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-3xl border border-ink-200/80 bg-white/70 p-5 dark:border-ink-800 dark:bg-ink-900/50 sm:p-6">
        <legend className="px-2 text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">
          3. Evidence (optional)
        </legend>
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Screenshots, short video clips, audio, or a PDF can help staff investigate. Files are
          stored privately and are only visible to the moderation team — they are never posted to
          Discord or published on this website.
        </p>

        <div>
          <label htmlFor="report-evidence" className="field-label">
            Attach files
          </label>
          <input
            id="report-evidence"
            name="evidence"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif,application/pdf,text/plain,video/mp4,audio/mpeg,audio/ogg"
            onChange={(event) => void handleFiles(event.target.files)}
            aria-describedby="report-evidence-help"
            className="input file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          <p id="report-evidence-help" className="field-help">
            Up to {REPORT_LIMITS.EVIDENCE_MAX_FILES} files, {formatReportBytes(REPORT_LIMITS.EVIDENCE_MAX_BYTES)}{" "}
            each. Executables and scripts are rejected.
          </p>
        </div>

        {uploadError && (
          <Alert tone="danger" title="Attachment problem">
            {uploadError}
          </Alert>
        )}

        {uploading && (
          <p className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300" role="status">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" aria-hidden />
            Uploading your files…
          </p>
        )}

        {attachments.length > 0 && (
          <ul className="space-y-2">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
              >
                <span className="min-w-0 truncate">
                  <IconShield size={14} className="mr-1.5 inline text-emerald-600" aria-hidden />
                  {file.fileName}{" "}
                  <span className="text-ink-500 dark:text-ink-400">({formatReportBytes(file.size)})</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((current) => current.filter((item) => item.id !== file.id))
                  }
                  className="btn-icon"
                  aria-label={`Remove ${file.fileName}`}
                >
                  <IconTrash size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="space-y-5 rounded-3xl border border-ink-200/80 bg-white/70 p-5 dark:border-ink-800 dark:bg-ink-900/50 sm:p-6">
        <legend className="px-2 text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">
          4. About you (optional)
        </legend>

        <div className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-700 dark:bg-ink-800/60">
          <input
            type="checkbox"
            id="report-anonymous"
            name="anonymous"
            checked={anonymous}
            onChange={(event) => setAnonymous(event.target.checked)}
            aria-describedby="report-anonymous-help"
            className="mt-1 h-5 w-5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <label htmlFor="report-anonymous" className="font-semibold text-ink-800 dark:text-ink-100">
              Submit anonymously
            </label>
            <p id="report-anonymous-help" className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              Your name and contact details are hidden from the moderation team and cannot be
              attached to this report. Anonymous does not mean untraceable — our hosting and
              security logs may still record technical request data.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="report-name" className="field-label">
              Your name
            </label>
            <input
              id="report-name"
              name="reporterName"
              type="text"
              maxLength={REPORT_LIMITS.REPORTER_NAME_MAX}
              value={reporterName}
              onChange={(event) => setReporterName(event.target.value)}
              disabled={anonymous}
              autoComplete="name"
              className="input disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="report-email" className="field-label">
              Your email
            </label>
            <input
              id="report-email"
              name="reporterEmail"
              type="email"
              maxLength={REPORT_LIMITS.REPORTER_EMAIL_MAX}
              value={reporterEmail}
              onChange={(event) => setReporterEmail(event.target.value)}
              disabled={anonymous}
              autoComplete="email"
              className="input disabled:opacity-60"
            />
          </div>
        </div>
        <p className="text-xs text-ink-500 dark:text-ink-400">
          We only use your details to follow up on this report. We never sell or share them.
        </p>
      </fieldset>

      {state.status === "error" && (
        <Alert tone="danger" title="Check the form">
          <span className="flex items-start gap-2">
            <IconAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            {state.message}
          </span>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="btn-primary btn-lg"
          disabled={state.status === "submitting" || uploading}
        >
          {state.status === "submitting" ? "Submitting…" : "Submit report"}
        </button>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Reports are reviewed by the UGN moderation team. Urgent danger? Contact local emergency
          services first.
        </p>
      </div>
    </form>
  );
}