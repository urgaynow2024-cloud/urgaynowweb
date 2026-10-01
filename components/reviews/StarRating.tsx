import { getInitial, getRatingLabel } from "@/lib/reviews";

/**
 * Presentational review building blocks.
 *
 * Everything here is server-safe and driven entirely by `currentColor` and the
 * existing brand/surface/ink scales, so these components inherit whichever
 * seasonal theme is active without any theme-specific code.
 */

/**
 * Avatar tones are built exclusively from the `brand`, `surface` and `ink`
 * scales, which every seasonal theme redefines. Using fixed hues here would
 * leave light-mode circles on a dark Halloween or Christmas card.
 */
const AVATAR_TONES = [
  "bg-brand-100 text-brand-800 dark:bg-brand-900/70 dark:text-brand-100",
  "bg-brand-200/70 text-brand-900 dark:bg-brand-800/50 dark:text-brand-50",
  "bg-surface-200 text-ink-800 dark:bg-surface-800 dark:text-ink-100",
  "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200",
  "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
  "bg-brand-500/20 text-brand-800 dark:bg-brand-700/40 dark:text-brand-50",
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function ReviewAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const trimmed = name.trim();
  const tone = trimmed ? AVATAR_TONES[hashName(trimmed) % AVATAR_TONES.length] : AVATAR_TONES[0];
  const dimensions = size === "sm" ? "h-9 w-9 text-sm" : "h-11 w-11 text-base";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dimensions} ${tone}`}
    >
      {getInitial(trimmed)}
    </span>
  );
}

function Star({ filled, className = "h-4 w-4" }: { filled: boolean; className?: string }) {
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
 * Read-only star rating. The stars themselves are decorative; the value is
 * exposed once as text so screen readers announce "4 out of 5 stars" rather
 * than five separate images.
 */
export function StarRating({
  rating,
  size = "md",
  showValue = false,
  className = "",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));
  const starSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  const textSize = size === "lg" ? "text-lg" : "text-sm";

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span role="img" aria-label={getRatingLabel(clamped)} className="inline-flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star key={value} filled={value <= clamped} className={starSize} />
        ))}
      </span>
      {showValue && <span className={`${textSize} font-medium text-ink-700 dark:text-ink-200`}>{clamped}.0</span>}
    </span>
  );
}

/** Compact "4.8 · 32 reviews" summary line. */
export function RatingSummaryBar({
  average,
  total,
}: {
  average: number;
  total: number;
}) {
  return (
    <p className="text-sm text-ink-600 dark:text-ink-300">
      <span className="font-semibold text-ink-900 dark:text-ink-50">{average.toFixed(1)}</span>
      {" out of 5 "}
      <span className="text-ink-400 dark:text-ink-500">·</span>{" "}
      <span>
        {total} {total === 1 ? "review" : "reviews"}
      </span>
    </p>
  );
}

/** Horizontal bar for one star level in the distribution breakdown. */
export function RatingDistributionRow({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="w-14 shrink-0 text-ink-600 dark:text-ink-300">
        {stars} {stars === 1 ? "star" : "stars"}
      </span>
      <span
        className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800"
        role="img"
        aria-label={`${percent}% of reviews are ${stars} stars`}
      >
        <span className="block h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
      </span>
      <span className="w-10 shrink-0 text-right tabular-nums text-ink-500 dark:text-ink-400">{count}</span>
    </li>
  );
}