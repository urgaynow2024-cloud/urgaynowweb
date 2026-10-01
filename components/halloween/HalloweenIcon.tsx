"use client";

import Image from "next/image";
import { HALLOWEEN_ICON_PATH } from "@/lib/halloween";
import { useHalloweenIconAvailable } from "./HalloweenIconProvider";

/**
 * The supplied official UGN Halloween icon.
 *
 * The exact asset is rendered as-is — no recolouring, no redrawing, no
 * distortion. Whether the file exists is decided on the server and passed down
 * by `HalloweenIconProvider`; when it is absent the component renders a neutral
 * decorative placeholder instead of a broken image.
 */
export function HalloweenIcon({
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
  const available = useHalloweenIconAvailable();

  if (!available) {
    return (
      <span
        aria-hidden={decorative ? "true" : undefined}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : "Ur Gay Now Halloween"}
        className={`hw-fallback inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" width={size} height={size} focusable="false">
          <circle cx="16" cy="18" r="11" fill="#FF8A1F" />
          <circle cx="16" cy="18" r="11" fill="none" stroke="#B42335" strokeWidth="1.5" />
          <path d="M16 7c-1-2 0-3.5 1.5-4 .5 1.5 0 3-1.5 4Z" fill="#6D28D9" />
          <path d="M11 16.5l3.5 2.5-3.5 2.5zM21 16.5l-3.5 2.5 3.5 2.5z" fill="#2A123D" />
          <path d="M11.5 23.5h9l-4.5 4z" fill="#2A123D" />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src={HALLOWEEN_ICON_PATH}
      alt={decorative ? "" : "Ur Gay Now Halloween"}
      aria-hidden={decorative ? "true" : undefined}
      width={size}
      height={size}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ width: size, height: "auto" }}
    />
  );
}

export default HalloweenIcon;