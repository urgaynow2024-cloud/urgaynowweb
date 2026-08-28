import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
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
    <section className={`section ${className}`}>
      {title && (
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-lg text-ink-500 dark:text-ink-400">{subtitle}</p>
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
  className = "",
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border-b border-ink-200 bg-pride-gradient-soft dark:border-ink-800 dark:bg-gradient-to-r dark:from-brand-900/30 dark:via-transparent dark:to-brand-800/20 ${className}`}
    >
      <div className="absolute inset-0 bg-hero-mesh opacity-60 dark:opacity-40" />
      <div className="noise-overlay" />
      <Container className="relative py-16 sm:py-20">
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent dark:from-brand-200 dark:to-brand-300">
            {title}
          </span>
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-ink-500 dark:text-ink-300 sm:text-xl">
            {description}
          </p>
        )}
      </Container>
    </div>
  );
}
