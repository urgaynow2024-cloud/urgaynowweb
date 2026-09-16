import { Skeleton } from "@/components/Skeleton";

export function EventPageSkeleton() {
  return (
    <article className="min-h-screen">
      <header className="relative h-64 md:h-96 lg:h-[500px] w-full overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 rounded-full mb-4" />
            <Skeleton className="h-12 w-3/4 mb-3" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-14 rounded-xl mb-8" />

        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="space-y-4 mb-12">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>

        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="space-y-4 mb-12">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>

        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </main>
    </article>
  );
}