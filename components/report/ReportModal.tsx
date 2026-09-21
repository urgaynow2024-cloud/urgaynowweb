"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { IconFlag, IconSend, IconX, IconImage, IconLink } from "@/components/admin/ui/icons";
import { REPORT_REASONS, DESCRIPTION_MAX_LENGTH } from "@/lib/reports";
import type { ReportContentType } from "@/lib/reports";

export interface ReportModalProps {
  contentType: ReportContentType;
  contentId: string;
  contentTitle?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (reportToken: string) => void;
}

const URL_REGEX = /^https?:\/\/.+/i;

export function ReportModal({
  contentType,
  contentId,
  contentTitle,
  open,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setReason("");
    setDescription("");
    setEvidenceUrls("");
    setError("");
    setSuccess(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/report/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          description,
          evidence: evidenceUrls
            .split("\n")
            .map((u) => u.trim())
            .filter((u) => u && URL_REGEX.test(u)),
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

  if (success) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Report submitted successfully!"
        description="Your report has been received by our moderation team."
      >
        <div className="space-y-4">
          <Alert tone="success" title="Thank you for reporting">
            Our moderation team will review your report as soon as possible.
          </Alert>
          <p className="text-sm text-ink-600 dark:text-ink-400">
            Reference:{" "}
            <code className="font-mono text-ink-800 dark:text-ink-200">{success}</code>
          </p>
          <p className="text-sm text-ink-600 dark:text-ink-400">
            Save this reference to{" "}
            <a
              href={`/report/track/${success}`}
              className="font-medium text-brand-600 underline dark:text-brand-300"
            >
              track your report status
            </a>
            .
          </p>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Report content"
      description={contentTitle ? `Reporting: ${contentTitle}` : "Report this content to our moderation team."}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert tone="danger" title="Could not submit your report">
            {error}
          </Alert>
        )}

        <div>
          <label htmlFor="report-reason" className="field-label">
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            id="report-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="select w-full"
          >
            <option value="">Select a reason</option>
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-description" className="field-label">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="report-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={4}
            placeholder="Tell the moderation team what is wrong with this content..."
            className="textarea w-full resize-y"
          />
          <div className="mt-1 flex justify-between gap-4 text-xs text-ink-500 dark:text-ink-400">
            <span>Be specific — include links, timestamps, and any relevant context.</span>
            <span>{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
          </div>
        </div>

        <div>
          <label htmlFor="report-evidence" className="field-label">
            Evidence (optional)
          </label>
          <p className="text-xs text-ink-500 dark:text-ink-400 mb-2">
            Paste URLs to screenshots or supporting images (one per line).
          </p>
          <textarea
            id="report-evidence"
            value={evidenceUrls}
            onChange={(e) => setEvidenceUrls(e.target.value)}
            placeholder="https://example.com/screenshot1.png&#10;https://example.com/screenshot2.png"
            rows={2}
            className="textarea w-full resize-y font-mono text-xs"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-ink-100 dark:border-ink-800">
          <Button variant="secondary" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            <IconSend size={16} className="mr-1.5" />
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ReportButton({
  contentType,
  contentId,
  contentTitle,
  size = "sm",
  variant = "outline" as const,
  className = "",
}: {
  contentType: ReportContentType;
  contentId: string;
  contentTitle?: string;
  size?: "sm" | "md";
  variant?: "ghost" | "secondary" | "outline";
  className?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
          variant === "ghost"
            ? "text-ink-500 hover:bg-ink-100 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            : variant === "secondary"
            ? "btn-secondary"
            : "btn-outline"
        } ${size === "sm" ? "btn-sm" : ""} ${className}`}
        aria-label={`Report ${contentTitle || "this content"}`}
      >
        <IconFlag size={14} />
        Report
      </button>
      <ReportModal
        contentType={contentType}
        contentId={contentId}
        contentTitle={contentTitle}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
