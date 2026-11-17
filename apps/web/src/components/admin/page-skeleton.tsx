export function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="Ачаалж байна">
      <div className="h-8 w-48 rounded-lg bg-border" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-border" />
        <div className="h-24 rounded-xl bg-border" />
        <div className="h-24 rounded-xl bg-border" />
      </div>
    </div>
  );
}
