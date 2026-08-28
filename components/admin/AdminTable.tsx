import { ReactNode } from "react";

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  emptyMessage?: string;
  emptyIcon?: string;
}

export function AdminTable<T>({ data, columns, keyField, emptyMessage = "No data available", emptyIcon = "📭" }: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-ink-50 py-12 dark:border-ink-700 dark:bg-ink-900/50">
        <span className="text-4xl mb-4">{emptyIcon}</span>
        <p className="text-ink-600 dark:text-ink-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/80 text-left text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:border-ink-800 dark:bg-ink-800/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-3 font-semibold ${column.className || ""}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {data.map((item) => (
              <tr
                key={String(item[keyField])}
                className="transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 text-sm text-ink-900 dark:text-white ${column.className || ""}`}
                  >
                    {column.render ? column.render(item) : String(item[column.key as keyof T])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
