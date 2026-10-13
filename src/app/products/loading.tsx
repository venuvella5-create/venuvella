/**
 * Shown instantly while a products page is loading, so a click on the
 * Products tab or on a product card gives immediate feedback.
 * (Next.js uses this file for /products and for every /products/[slug] page.)
 */
export default function Loading() {
  return (
    <main
      className="py-12 sm:py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="container-shell">
        <p className="sr-only">Loading…</p>

        <div className="h-3 w-28 animate-pulse rounded-full bg-[var(--line)]" />

        <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-lg bg-[var(--line)]" />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-square w-full animate-pulse rounded-2xl bg-[var(--line)]" />

              <div className="mt-4 h-3 w-20 animate-pulse rounded-full bg-[var(--line)]" />

              <div className="mt-3 h-4 w-4/5 animate-pulse rounded-full bg-[var(--line)]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
