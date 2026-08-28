import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200/80 bg-white/50 p-12 text-center backdrop-blur-sm dark:border-ink-700/60 dark:bg-ink-900/30 ${className}`}
    >
      {icon && (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 text-4xl shadow-inner dark:from-brand-900/40 dark:to-brand-800/30">
          <span className="animate-float">{typeof icon === "string" ? icon : icon}</span>
        </div>
      )}
      <h3 className="text-xl font-bold text-ink-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
