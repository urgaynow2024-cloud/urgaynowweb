import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconAlert, IconCheck, IconInfo, IconShield } from "@/components/admin/ui/icons";

type Tone = "info" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-500/10 dark:text-sky-200",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
  danger: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-500/10 dark:text-red-200",
};

const icons: Record<Tone, ReactNode> = {
  info: <IconInfo size={20} />,
  success: <IconCheck size={20} />,
  warning: <IconAlert size={20} />,
  danger: <IconShield size={20} />,
};

export function Alert({
  tone = "info",
  title,
  children,
  className = "",
  action,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-2xl border p-4 text-sm", toneClass[tone], className)}
    >
      <span className="mt-0.5 shrink-0" aria-hidden>
        {icons[tone]}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="mt-1 leading-relaxed">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
