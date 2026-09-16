"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { Alert, Button } from "@/components/ui";

export interface ReportFormProps {
  submissionId: string;
  submissionTitle: string;
  onSuccess?: (token: string) => void;
}

const REASONS = [
  { value: "HARASSMENT", label: "Harassment" },
  { value: "HATE_SPEECH", label: "Hate speech" },
  { value: "NSFW", label: "NSFW / Sexual content" },
  { value: "SCAM", label: "Scam / Fraud" },
  { value: "IMPERSONATION", label: "Impersonation" },
  { value: "RULE_VIOLATION", label: "Rule violation" },
  { value: "BUG", label: "Website bug" },
  { value: "EVENT_ISSUE", label: "Event issue" },
  { value: "COMMUNITY_CONTENT", label: "Community content" },
  { value: "OTHER", label: "Other" },
];

export function ReportForm({ submissionId, submissionTitle, onSuccess }: ReportFormProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/report/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          reason,
          details,
          reporterName,
          reporterEmail,
          anonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit report");
      }

      setSuccess(data.reportToken);
      if (onSuccess) onSuccess(data.reportToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === "reason") setReason(value);
    else if (name === "details") setDetails(value);
    else if (name === "reporterName") setReporterName(value);
    else if (name === "reporterEmail") setReporterEmail(value);
    else if (name === "anonymous" && type === "checkbox") setAnonymous((e.target as HTMLInputElement).checked);
  };

  if (success) {
    return (
      <Alert tone="success" title="Report submitted successfully!">
        Your report reference is: <code className="font-mono">{success.slice(0, 12)}…</code>. Save it to{" "}
        <Link href={`/report/track/${success}`} className="font-medium underline">track your report status</Link>.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}

      <div>
        <label htmlFor="reason" className="field-label">
          Reason <span className="text-red-500">*</span>
        </label>
        <select
          id="reason"
          name="reason"
          value={reason}
          onChange={handleChange}
          required
          className="select"
        >
          <option value="">Select a reason</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="details" className="field-label">
          Details <span className="text-red-500">*</span>
        </label>
        <textarea
          id="details"
          name="details"
          value={details}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe what happened. Include links, timestamps, or any other relevant information."
          className="textarea"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reporterName" className="field-label">
            Your Name (optional)
          </label>
          <input
            id="reporterName"
            name="reporterName"
            type="text"
            value={reporterName}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={anonymous}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="reporterEmail" className="field-label">
            Your Email (optional)
          </label>
          <input
            id="reporterEmail"
            name="reporterEmail"
            type="email"
            value={reporterEmail}
            onChange={handleChange}
            placeholder="john@example.com"
            disabled={anonymous}
            className="input"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl border border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-800/50">
        <input
          type="checkbox"
          id="anonymous"
          name="anonymous"
          checked={anonymous}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
        />
        <div className="pt-1">
          <label htmlFor="anonymous" className="font-medium cursor-pointer">
            Submit anonymously
          </label>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Your name and email will be hidden from moderators. Only the report details and
            category will be visible. Note: Anonymous does not mean technically untraceable
            if server/security logs are retained.
          </p>
        </div>
      </div>

      <Button type="submit" loading={isSubmitting}>
        Submit Report
      </Button>
    </form>
  );
}