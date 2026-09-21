"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  { group: "Technical", options: ["Bug Report", "Technical Problem", "Report a Website Issue", "Feature Request"] },
  { group: "Community & Safety", options: ["Community / Discord", "Moderation / Safety", "Moderation Appeal", "Harassment / Report", "Report Content"] },
  { group: "Account & Purchases", options: ["Account / Discord Issue", "Shop / Purchase", "Creator Support"] },
  { group: "General", options: ["General Question", "Feedback / Suggestions", "Partnership / Collaboration", "Privacy / Data Request", "Content / Resources", "Other"] },
];

const CONTACT_METHODS = [
  { value: "discord", label: "Discord Username" },
  { value: "email", label: "Email Address" },
  { value: "other", label: "Other" },
];

const CONTACT_HELPER: Record<string, string> = {
  discord: "Enter your Discord username (e.g. username#1234) so our team can contact you.",
  email: "Enter the email address you'd like us to use for your reply.",
  other: "Enter whatever contact method you prefer so our team can reach you.",
};

const MAX_SUBJECT = 120;
const MAX_DESCRIPTION = 3000;

interface FormErrors {
  category?: string;
  subject?: string;
  description?: string;
  contactMethod?: string;
  contactInfo?: string;
}

interface FormData {
  category: string;
  subject: string;
  description: string;
  contactMethod: string;
  contactInfo: string;
}

export function SupportContactForm() {
  const [formData, setFormData] = useState<FormData>({
    category: "",
    subject: "",
    description: "",
    contactMethod: "",
    contactInfo: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ ticketNumber: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formData.category) next.category = "Please select a category.";
    if (!formData.subject.trim()) {
      next.subject = "Subject is required.";
    } else if (formData.subject.length > MAX_SUBJECT) {
      next.subject = `Subject must be ${MAX_SUBJECT} characters or fewer.`;
    }
    if (!formData.description.trim()) {
      next.description = "Description is required.";
    } else if (formData.description.length > MAX_DESCRIPTION) {
      next.description = `Description must be ${MAX_DESCRIPTION} characters or fewer.`;
    }
    if (!formData.contactMethod) next.contactMethod = "Please select a contact method.";
    if (!formData.contactInfo.trim()) {
      next.contactInfo = "Contact information is required.";
    } else if (formData.contactInfo.length > 200) {
      next.contactInfo = "Contact information must be 200 characters or fewer.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          contactMethod: formData.contactMethod,
          contactInfo: formData.contactInfo.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({ ticketNumber: data.ticketNumber });
        setFormData({
          category: "",
          subject: "",
          description: "",
          contactMethod: "",
          contactInfo: "",
        });
      } else {
        setSubmitError(data.error || "Could not submit your request. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl">
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center dark:border-emerald-800 dark:bg-emerald-950/30"
        >
          <h2 className="text-2xl font-extrabold text-ink-900 dark:text-white">
            Support request submitted!
          </h2>
          <p className="mt-4 text-sm text-ink-600 dark:text-ink-400">
            Your ticket number is:
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="font-mono text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {success.ticketNumber}
            </p>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(success.ticketNumber);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-medium text-ink-700 opacity-80 transition-opacity hover:opacity-100 dark:bg-ink-800 dark:text-ink-300"
              aria-label="Copy ticket number"
              title="Copy ticket number"
            >
              {copied ? "✓" : "📋"}
            </button>
          </div>
          <p className="mt-4 text-sm text-ink-600 dark:text-ink-400">
            Keep this number somewhere safe.
          </p>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-400">
            Our team will review your request and contact you using the details you provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Category
          <span className="text-red-500" aria-hidden> *</span>
        </label>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">Select the topic that best fits your request.</p>
        <select
          id="category"
          value={formData.category}
          onChange={(event) => update("category", event.target.value)}
          className="mt-2 block w-full appearance-none rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          aria-describedby={errors.category ? "category-error" : undefined}
          aria-invalid={!!errors.category}
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.category && (
          <p id="category-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.category}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Subject
          <span className="text-red-500" aria-hidden> *</span>
        </label>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          A brief summary of your request ({formData.subject.length}/{MAX_SUBJECT}).
        </p>
        <input
          id="subject"
          type="text"
          value={formData.subject}
          onChange={(event) => update("subject", event.target.value)}
          maxLength={MAX_SUBJECT}
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          placeholder="e.g. Having trouble accessing the gallery…"
          aria-describedby={errors.subject ? "subject-error" : "subject-hint"}
          aria-invalid={!!errors.subject}
        />
        {errors.subject ? (
          <p id="subject-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.subject}
          </p>
        ) : (
          <p id="subject-hint" className="mt-1 text-xs text-ink-400 dark:text-ink-500">
            Max {MAX_SUBJECT} characters.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Description
          <span className="text-red-500" aria-hidden> *</span>
        </label>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          Describe your issue or question in detail ({formData.description.length}/{MAX_DESCRIPTION}).
        </p>
        <textarea
          id="description"
          value={formData.description}
          onChange={(event) => update("description", event.target.value)}
          maxLength={MAX_DESCRIPTION}
          rows={5}
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          placeholder="Tell us what happened or what you need help with…"
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          aria-invalid={!!errors.description}
        />
        {errors.description ? (
          <p id="description-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.description}
          </p>
        ) : (
          <p id="description-hint" className="mt-1 text-xs text-ink-400 dark:text-ink-500">
            Max {MAX_DESCRIPTION} characters.
          </p>
        )}
      </div>

      <div>
        <span className="block text-sm font-semibold text-ink-900 dark:text-white">
          Contact Method
          <span className="text-red-500" aria-hidden> *</span>
        </span>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">How would you like us to reach you?</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Contact method">
          {CONTACT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => update("contactMethod", method.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                formData.contactMethod === method.value
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50/50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
              }`}
              role="radio"
              aria-checked={formData.contactMethod === method.value}
            >
              {method.value === "discord" && "💬"}
              {method.value === "email" && "✉️"}
              {method.value === "other" && "📞"}
              {method.label}
            </button>
          ))}
        </div>
        {errors.contactMethod && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.contactMethod}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contactInfo" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Contact Information
          <span className="text-red-500" aria-hidden> *</span>
        </label>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          {formData.contactMethod ? CONTACT_HELPER[formData.contactMethod] : "Please select a contact method above first."}
        </p>
        <input
          id="contactInfo"
          type="text"
          value={formData.contactInfo}
          onChange={(event) => update("contactInfo", event.target.value)}
          maxLength={200}
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          placeholder={formData.contactMethod === "discord" ? "username#1234" : formData.contactMethod === "email" ? "you@example.com" : "Your preferred contact details"}
          aria-describedby={errors.contactInfo ? "contactInfo-error" : "contactInfo-hint"}
          aria-invalid={!!errors.contactInfo}
        />
        {errors.contactInfo ? (
          <p id="contactInfo-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.contactInfo}
          </p>
        ) : (
          <p id="contactInfo-hint" className="mt-1 text-xs text-ink-400 dark:text-ink-500">
            Max 200 characters.
          </p>
        )}
      </div>

      {submitError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {submitError}
        </div>
      )}

      <div>
        <Button type="submit" loading={loading} className="w-full md:w-auto">
          Submit request
        </Button>
      </div>
    </form>
  );
}
