export function LoadingSkeleton(): React.JSX.Element {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-[var(--brand-100)] bg-white">
          <div className="aspect-[4/3] animate-pulse bg-[var(--brand-100)]" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--brand-100)]" />
            <div className="h-3 w-full animate-pulse rounded bg-[var(--brand-50)]" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--brand-50)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

