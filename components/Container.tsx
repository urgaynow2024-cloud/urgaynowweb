import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className={`py-12 ${className}`}>
      {title && (
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-zinc-200 bg-pride-gradient-soft dark:border-zinc-800">
      <Container className="py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        )}
      </Container>
    </div>
  );
}
