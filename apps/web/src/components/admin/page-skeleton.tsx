export function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="Ачаалж байна">
      <div className="h-8 w-56 rounded-lg bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-3xl bg-surface-2" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-surface-2" />
    </div>
  );
}
