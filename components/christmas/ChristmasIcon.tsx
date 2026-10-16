"use client";

import Image from "next/image";
import { CHRISTMAS_ICON_PATH } from "@/lib/christmas";
import { useChristmasIconAvailable } from "./ChristmasIconProvider";

/**
 * The supplied official UGN Christmas icon.
 *
 * The exact asset is rendered as-is — no recolouring, no redrawing, no
 * distortion. Whether the file exists is decided on the server and passed down
 * by `ChristmasIconProvider`; when it is absent the component renders a neutral
 * decorative placeholder instead of a broken image.
 */
export function ChristmasIcon({
  className = "",
  size = 48,
  priority = false,
  decorative = true,
}: {
  className?: string;
  /** Rendered pixel size (both width and height) when using the supplied asset. */
  size?: number;
  priority?: boolean;
  decorative?: boolean;
}) {
  const available = useChristmasIconAvailable();

  if (!available) {
    return (
      <span
        aria-hidden={decorative ? "true" : undefined}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : "Ur Gay Now Christmas"}
        className={`cw-fallback inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" width={size} height={size} focusable="false">
          {/* Winter-night circle */}
          <circle cx="16" cy="18" r="11" fill="#0A0D18" />
          <circle cx="16" cy="18" r="11" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Tree */}
          <polygon points="16,8 24,21 8,21" fill="#16A34A" opacity="0.9" />
          <polygon points="16,11 21,21 11,21" fill="#16A34A" opacity="0.7" />
          {/* Trunk */}
          <rect x="14" y="21" width="4" height="3" fill="#8B4513" />
          {/* Star */}
          <polygon
            points="16,8 17.2,10.4 19.8,10.4 17.5,12 18.2,14.6 16,12.6 13.8,14.6 14.5,12 12.2,10.4 14.8,10.4"
            fill="#FACC15"
          />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src={CHRISTMAS_ICON_PATH}
      alt={decorative ? "" : "Ur Gay Now Christmas"}
      aria-hidden={decorative ? "true" : undefined}
      width={size}
      height={size}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ width: size, height: "auto" }}
    />
  );
}

export default ChristmasIcon;
