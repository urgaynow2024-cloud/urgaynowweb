export function Progress({ value, tone = "brand", className = "" }: { value: number; tone?: "brand" | "emerald" | "amber" | "red"; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = {
    brand: "bg-brand-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  }[tone];
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800 ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-[width] duration-700 ease-spring`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
