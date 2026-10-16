"use client";

import { useState, FormEvent } from "react";
import { Alert } from "@/components/ui";
import Link from "next/link";

interface PartnershipApplyFormProps {}

function PartnershipApplyForm() {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    discord: string;
    website: string;
    description: string;
  }>({
    name: "",
    email: "",
    discord: "",
    website: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = "Name is required.";
    else if (formData.name.length > 200) next.name = "Name must be 200 characters or fewer.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) next.email = "Email address is required.";
    else if (!emailRegex.test(formData.email)) next.email = "Please enter a valid email address.";
    if (formData.discord && formData.discord.length > 100) {
      next.discord = "Discord username must be 100 characters or fewer.";
    }
    if (formData.website && formData.website.length > 500) {
      next.website = "Website must be 500 characters or fewer.";
    }
    if (!formData.description.trim()) next.description = "Description is required.";
    else if (formData.description.length < 10) {
      next.description = "Description must be at least 10 characters.";
    } else if (formData.description.length > 5000) {
      next.description = "Description must be 5000 characters or fewer.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/partnership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          discord: formData.discord.trim(),
          website: formData.website.trim(),
          description: formData.description.trim(),
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({ id: data.id, name: data.name });
        setFormData({
          name: "",
          email: "",
          discord: "",
          website: "",
          description: "",
        });
      } else if (response.status === 409 || data.duplicate) {
        setSubmitError(
          data.error || "You already submitted a partnership application with these details.",
        );
      } else {
        setSubmitError(data.error || "Could not submit your application. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
        <h2 className="text-2xl font-extrabold text-ink-900 dark:text-white">
          Application received
        </h2>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-400">
          Thank you for applying, {success.name}. Our staff team will review your application and
          contact you via the email you provided.
        </p>
        <p className="mt-4 text-sm text-ink-600 dark:text-ink-400">
          Application reference: <code className="font-mono text-brand-600 dark:text-brand-400">{success.id}</code>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/partners" className="btn-secondary">
            View existing partners
          </Link>
          <Link href="/" className="btn-ghost">
            Back to the site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <Alert tone="danger" title="Your application was not sent">{submitError}</Alert>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Organization / Community Name
          <span className="text-red-500" aria-hidden> *</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          maxLength={200}
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Contact Email
          <span className="text-red-500" aria-hidden> *</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, email: e.target.value }));
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="discord" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Discord Username
        </label>
        <input
          id="discord"
          name="discord"
          type="text"
          value={formData.discord}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, discord: e.target.value }));
            setErrors((prev) => ({ ...prev, discord: undefined }));
          }}
          maxLength={100}
          placeholder="e.g. username#1234"
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          aria-invalid={!!errors.discord}
          aria-describedby={errors.discord ? "discord-error" : undefined}
        />
        {errors.discord && (
          <p id="discord-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.discord}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-semibold text-ink-900 dark:text-white">
          Website / Link
        </label>
        <input
          id="website"
          name="website"
          type="url"
          value={formData.website}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, website: e.target.value }));
            setErrors((prev) => ({ ...prev, website: undefined }));
          }}
          maxLength={500}
          placeholder="https://discord.gg/..."
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          aria-invalid={!!errors.website}
          aria-describedby={errors.website ? "website-error" : undefined}
        />
        {errors.website && (
          <p id="website-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.website}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-ink-900 dark:text-white">
          About You / Your Community
          <span className="text-red-500" aria-hidden> *</span>
        </label>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          Tell us about your community or project and why you want to partner with Ur Gay Now.
        </p>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, description: e.target.value }));
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          rows={5}
          maxLength={5000}
          className="mt-2 block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-brand-500"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`btn-primary w-full sm:w-auto ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}

export default PartnershipApplyForm;
