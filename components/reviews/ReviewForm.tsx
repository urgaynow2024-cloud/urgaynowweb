"use client";

import { useState, FormEvent } from "react";
import { Alert, Button } from "@/components/ui";
import { StarRatingInput } from "@/components/reviews/StarRatingInput";
import { REVIEW_LIMITS, validateReviewSubmission } from "@/lib/reviews";

type FormErrors = Partial<Record<"displayName" | "handle" | "rating" | "content", string>>;

/**
 * Public review submission form.
 *
 * Client-side validation mirrors the API exactly so people get fast feedback,
 * but the server re-runs every check — this copy exists only for convenience.
 */
export function ReviewForm() {
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [showUsername, setShowUsername] = useState(true);
  const [website, setWebsite] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    const validation = validateReviewSubmission({
      displayName,
      handle,
      rating,
      content,
      showUsername,
      website,
    });

    if (!validation.ok) {
      if ("spam" in validation && validation.spam) {
        setSubmitted(true);
        return;
      }
      const field = "field" in validation ? (validation.field as keyof FormErrors | undefined) : undefined;
      const message = "error" in validation ? validation.error : "Please check your review.";
      if (field) setErrors({ [field]: message });
      else setSubmitError(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.value),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const field = typeof data.field === "string" ? (data.field as keyof FormErrors) : undefined;
        const message = data.error || "We couldn't submit your review. Please try again.";
        if (field) setErrors({ [field]: message });
        else setSubmitError(message);
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't submit your review. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Alert tone="success" title="Thanks for sharing your experience!">
        Your review has been sent to our staff team for approval. Once it&apos;s approved it will appear on this
        page. Approved reviews are public, so please don&apos;t include anything you&apos;d rather keep private.
      </Alert>
    );
  }

  const remaining = REVIEW_LIMITS.CONTENT_MAX - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError && <Alert tone="danger">{submitError}</Alert>}

      <Alert tone="info" title="Before you submit">
        Reviews are read by our staff team first. If your review is approved it will be published publicly on this
        page, along with the display name you choose and your star rating. Please don&apos;t include personal
        information or anything you&apos;d rather keep private.
      </Alert>

      <div>
        <label htmlFor="review-displayName" className="field-label">
          Display name <span className="text-red-500">*</span>
        </label>
        <input
          id="review-displayName"
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            clearFieldError("displayName");
          }}
          required
          maxLength={REVIEW_LIMITS.DISPLAY_NAME_MAX}
          autoComplete="nickname"
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={errors.displayName ? "review-displayName-error" : "review-displayName-help"}
          placeholder="How should we credit you?"
          className="input"
        />
        {errors.displayName ? (
          <p id="review-displayName-error" role="alert" className="field-error">
            {errors.displayName}
          </p>
        ) : (
          <p id="review-displayName-help" className="field-help">
            Shown publicly on your approved review.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="review-handle" className="field-label">
          Discord or VRChat username <span className="text-ink-400 dark:text-ink-500">(optional)</span>
        </label>
        <input
          id="review-handle"
          type="text"
          value={handle}
          onChange={(e) => {
            setHandle(e.target.value);
            clearFieldError("handle");
          }}
          maxLength={REVIEW_LIMITS.HANDLE_MAX}
          aria-invalid={Boolean(errors.handle)}
          aria-describedby="review-handle-help"
          placeholder="Only visible to staff"
          className="input"
        />
        <p id="review-handle-help" className="field-help">
          Never shown publicly. Staff only see this if they need to follow something up.
        </p>
      </div>

      <StarRatingInput value={rating} onChange={(next) => {
        setRating(next);
        clearFieldError("rating");
      }} error={errors.rating} />

      <div>
        <label htmlFor="review-content" className="field-label">
          Your review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            clearFieldError("content");
          }}
          rows={6}
          required
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "review-content-error" : "review-content-help"}
          placeholder="What has your experience been like with Ur Gay Now?"
          className="textarea"
        />
        {errors.content ? (
          <p id="review-content-error" role="alert" className="field-error">
            {errors.content}
          </p>
        ) : (
          <p id="review-content-help" className="field-help">
            At least {REVIEW_LIMITS.CONTENT_MIN} characters.{" "}
            <span className={remaining < 100 ? "text-amber-600 dark:text-amber-400" : undefined}>
              {remaining} characters remaining
            </span>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-900/50">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={showUsername}
            onChange={(e) => setShowUsername(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/40 dark:border-ink-600 dark:bg-ink-800"
          />
          <span className="text-sm text-ink-700 dark:text-ink-200">
            Show my display name publicly on this review
            <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">
              Leave this unchecked and your review will appear as &ldquo;Anonymous&rdquo;.
            </span>
          </span>
        </label>
      </div>

      {/* Honeypot: hidden from users, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="review-website">Website</label>
        <input
          id="review-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
        Submit for approval
      </Button>
    </form>
  );
}