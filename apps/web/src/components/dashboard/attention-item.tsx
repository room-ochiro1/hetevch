import Link from 'next/link';

import { promoteCategory } from '@/app/(admin)/categories/actions';
import { ConfirmFlow } from '@/components/ui/confirm-flow';
import { buttonClass, ReviewRow } from '@/components/ui/confirm-parts';
import { CheckIcon, SparkIcon } from '@/components/ui/icons-more';
import type { Candidate, Insight } from '@/lib/insights';
import { formatCount } from '@/lib/format';

const STROKES = { warn: 'stroke-warn', income: 'stroke-income', expense: 'stroke-expense', accent: 'stroke-accent' } as const;

/** The small "progress ring + number" pill at the top right of a task. */
function RingPill({ ratio, text, tone }: Insight['ring'] & { tone: Insight['tone'] }) {
  const circumference = 2 * Math.PI * 6;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold tabular-nums shadow-card ring-1 ring-border">
      <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 -rotate-90">
        <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2.5" className="stroke-surface-2" />
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(1, Math.max(0.04, ratio)) * circumference} ${circumference}`}
          className={STROKES[tone]}
        />
      </svg>
      {text}
    </span>
  );
}

/** Adds a much-used personal category to the built-in list, after a review + confirm dialog. */
function PromoteButton({ candidate }: { candidate: Candidate }) {
  const kind = candidate.kind === 'income' ? 'Орлого' : 'Зарлага';
  return (
    <ConfirmFlow
      trigger={{ label: 'Нийтэд нэмэх', size: 'sm', icon: <CheckIcon className="size-3.5" /> }}
      tone="accent"
      icon={<SparkIcon className="size-5" />}
      title="Нийтийн ангилалд нэмэх"
      subtitle="Бүх хэрэглэгчийн аппад шинэ ангилал болж харагдана"
      review={
        <>
          <ReviewRow label="Ангилал">
            {candidate.icon} {candidate.name}
          </ReviewRow>
          <ReviewRow label="Төрөл">{kind}</ReviewRow>
          <ReviewRow label="Өөрөө нэмсэн хэрэглэгч">{formatCount(candidate.owners)}</ReviewRow>
          <ReviewRow label="Тэдний гүйлгээ">{formatCount(candidate.txCount)}</ReviewRow>
        </>
      }
      summary={
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-surface text-3xl shadow-card">
            {candidate.icon}
          </span>
          <div>
            <p className="text-xs text-muted">Нийтэд нэмэгдэх ангилал</p>
            <p className="text-2xl font-semibold tracking-tight">{candidate.name}</p>
            <p className="text-xs text-muted">{kind} · жагсаалтын төгсгөлд</p>
          </div>
        </div>
      }
      checks={[
        'Нэр, дүрс нь бүх хэрэглэгчид ойлгомжтой гэдгийг шалгасан',
        'Хэрэглэгчдийн өөрийн ангилал хэвээр үлдэнэ гэдгийг ойлгож байна',
      ]}
      notice="Нэмсний дараа «Ангилал» хуудаснаас нэр, дүрс, эрэмбийг нь засах боломжтой."
      confirmLabel="Нэмэх"
      action={promoteCategory}
      fields={{ kind: candidate.kind, name: candidate.name, icon: candidate.icon, color: candidate.color }}
    />
  );
}

export function AttentionItem({ insight }: { insight: Insight }) {
  const { primary } = insight;
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-surface-2/60 p-4 ring-1 ring-border/70">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-lg shadow-card">
          {insight.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug font-semibold">{insight.title}</p>
          <p className="mt-0.5 text-xs text-muted">{insight.subtitle}</p>
        </div>
        <RingPill {...insight.ring} tone={insight.tone} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-xl bg-surface px-3 py-1.5 text-xs font-medium tabular-nums shadow-card ring-1 ring-border/70">
          {insight.chip}
        </span>
        <span className="flex-1" />
        {insight.secondary ? (
          <Link href={insight.secondary.href} scroll={false} className={buttonClass('secondary', 'sm')}>
            {insight.secondary.label}
          </Link>
        ) : null}
        {'promote' in primary ? (
          <PromoteButton candidate={primary.promote} />
        ) : (
          <Link href={primary.href} scroll={false} className={buttonClass('primary', 'sm')}>
            {primary.label}
          </Link>
        )}
      </div>
    </li>
  );
}
