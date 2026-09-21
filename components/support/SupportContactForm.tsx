"use client";

import { useState, FormEvent } from "react";
import { Alert, Card, Button } from "@/components/ui";

const CATEGORIES = [
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

const CONTACT_METHODS = [
  { value: "discord", label: "Discord Username" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export function SupportContactForm() {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("idle");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, description, contactMethod, contactInfo }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit");
      }

      setStatus("success");
      setTicketNumber(data.ticketNumber || "");
      setCategory("");
      setSubject("");
      setDescription("");
      setContactMethod("");
      setContactInfo("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-8">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-ink-900 dark:text-white mb-4">Submit a Support Request</h2>
        <p className="text-ink-500 dark:text-ink-400 mb-6">
          Can&apos;t find what you&apos;re looking for? Report a bug, ask a question, or share feedback.
        </p>

        {status === "success" && (
          <Alert tone="success" title={`Submitted! Your ticket number is ${ticketNumber}`}>
            We&apos;ve received your request and will get back to you soon. Save your ticket number for reference.
          </Alert>
        )}

        {status === "error" && (
          <Alert tone="danger" title="Submission failed">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="field-label">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="select w-full"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="field-label">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Brief summary of your issue"
              maxLength={120}
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="field-label">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Describe your issue in detail. Include steps to reproduce, screenshots links, etc."
              maxLength={3000}
              className="textarea w-full resize-y"
            />
          </div>

          <div>
            <label className="field-label">
              Contact Method <span className="text-red-500">*</span>
            </label>
            <select
              id="contactMethod"
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              required
              className="select w-full"
            >
              <option value="">Select a contact method</option>
              {CONTACT_METHODS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contactInfo" className="field-label">
              Contact Information <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">
              Please provide at least one way for our staff to contact you about your request.
            </p>
            <input
              id="contactInfo"
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              placeholder={contactMethod === "discord" ? "e.g. username#1234" : contactMethod === "email" ? "you@example.com" : "Your preferred contact method"}
              className="input w-full"
            />
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
            Submit Request
          </Button>
        </form>
      </Card>
    </Card>
  );
}