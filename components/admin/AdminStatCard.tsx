import { ReactNode } from "react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  description?: string;
}

export function AdminStatCard({ title, value, change, changeType = "neutral", icon, description }: AdminStatCardProps) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="eyebrow">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">{value}</p>
          {change && (
            <p className={`mt-2 text-sm font-medium ${
              changeType === "positive" ? "text-emerald-600 dark:text-emerald-400" :
              changeType === "negative" ? "text-red-600 dark:text-red-400" :
              "text-ink-500 dark:text-ink-400"
            }`}>
              {change}
            </p>
          )}
          {description && (
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
