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
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
          {change && (
            <p className={`mt-2 text-sm font-medium ${
              changeType === "positive" ? "text-green-600 dark:text-green-400" :
              changeType === "negative" ? "text-red-600 dark:text-red-400" :
              "text-zinc-600 dark:text-zinc-400"
            }`}>
              {change}
            </p>
          )}
          {description && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-brand-50 p-3 text-2xl dark:bg-brand-900/30">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
