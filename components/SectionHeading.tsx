import type { ReactNode } from "react";

export function SectionHeading({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizeClass = {
    sm: "text-2xl sm:text-3xl",
    default: "text-3xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
  };

  return (
    <h2 className={`section-title-accent ${sizeClass[size]} ${className}`}>
      {children}
    </h2>
  );
}
