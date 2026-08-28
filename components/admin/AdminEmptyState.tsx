import { ReactNode } from "react";

interface AdminEmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AdminEmptyState({ icon = "📭", title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-ink-50 py-16 px-6 text-center dark:border-ink-700 dark:bg-ink-900/50">
      <span className="text-6xl mb-6">{icon}</span>
      <h3 className="text-xl font-semibold text-ink-900 dark:text-white mb-2">{title}</h3>
      <p className="text-ink-600 dark:text-ink-400 mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
