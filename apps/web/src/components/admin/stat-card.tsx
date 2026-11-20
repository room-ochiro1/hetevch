import type { IconComponent } from '@/components/ui/icons';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: IconComponent;
  tone?: 'accent' | 'income' | 'expense';
};

const ICON_TONES = {
  accent: 'bg-accent-soft text-accent-text',
  income: 'bg-income-soft text-income',
  expense: 'bg-expense-soft text-expense',
} as const;

export function StatCard({ label, value, hint, icon: Icon, tone = 'accent' }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-surface p-5 shadow-card">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${ICON_TONES[tone]}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
