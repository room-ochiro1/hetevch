import { InboxIcon } from '@/components/ui/icons';

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-muted">
        <InboxIcon className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="max-w-sm text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}
