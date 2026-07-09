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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
        <span className="text-4xl mb-4">{emptyIcon}</span>
        <p className="text-zinc-600 dark:text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-800/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 ${column.className || ""}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {data.map((item) => (
              <tr
                key={String(item[keyField])}
                className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm text-zinc-900 dark:text-white ${column.className || ""}`}
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
