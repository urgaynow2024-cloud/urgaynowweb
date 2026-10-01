"use client";

import { useId } from "react";
import { REVIEW_RATING_MAX, REVIEW_RATING_MIN } from "@/lib/reviews";

const RATING_LABELS: Record<number, string> = {
  1: "1 star — poor",
  2: "2 stars — below average",
  3: "3 stars — okay",
  4: "4 stars — good",
  5: "5 stars — excellent",
};

function Star({ filled, className = "h-8 w-8" }: { filled: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 1.8l2.47 5.34 5.83.63-4.33 3.96 1.15 5.75L10 14.6l-5.12 2.88 1.15-5.75L1.7 7.77l5.83-.63L10 1.8z" />
    </svg>
  );
}

/**
 * Accessible 1-5 star input built on a native radio group inside a fieldset.
 *
 * Native radios mean keyboard arrow-key navigation, focus handling and form
 * semantics come from the browser rather than from custom key handlers.
 */
export function StarRatingInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
}) {
  const groupName = useId();
  const describedBy = error ? `${groupName}-error` : undefined;

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="field-label">
        Your rating <span className="text-red-500">*</span>
      </legend>

      <div className="flex flex-wrap items-center gap-1">
        {Array.from({ length: REVIEW_RATING_MAX - REVIEW_RATING_MIN + 1 }, (_, index) => {
          const rating = REVIEW_RATING_MIN + index;
          const isChecked = value === rating;

          return (
            <label
              key={rating}
              className={`cursor-pointer rounded-lg p-1 transition-colors ${
                isChecked ? "text-amber-500 dark:text-amber-400" : "text-ink-300 hover:text-amber-400 dark:text-ink-600"
              }`}
              title={RATING_LABELS[rating]}
            >
              <input
                type="radio"
                name={`${groupName}-rating`}
                value={rating}
                checked={isChecked}
                onChange={() => onChange(rating)}
                className="sr-only"
              />
              <Star filled={rating <= value} />
              <span className="sr-only">{RATING_LABELS[rating]}</span>
            </label>
          );
        })}

        <span aria-live="polite" className="ml-2 text-sm text-ink-600 dark:text-ink-300">
          {value > 0 ? RATING_LABELS[value] : "No rating selected"}
        </span>
      </div>

      {error && (
        <p id={`${groupName}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}