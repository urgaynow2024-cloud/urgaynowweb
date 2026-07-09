import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-secondary btn-sm">
          ← Prev
        </Link>
      ) : (
        <span aria-disabled className="btn-secondary btn-sm cursor-not-allowed opacity-40">
          ← Prev
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition ${
              p === page
                ? "bg-brand-600 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn-secondary btn-sm">
          Next →
        </Link>
      ) : (
        <span aria-disabled className="btn-secondary btn-sm cursor-not-allowed opacity-40">
          Next →
        </span>
      )}
    </nav>
  );
}
