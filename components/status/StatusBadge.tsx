import { statusColor } from "@/lib/status/colors";

export function StatusPill({ status, label }: { status: string; label: string }) {
  const c = statusColor(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.soft} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} aria-hidden />
      {label}
    </span>
  );
}
