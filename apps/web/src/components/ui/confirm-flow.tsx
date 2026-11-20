'use client';

import { useActionState, useRef, useState, type ReactNode } from 'react';

import { buttonClass, CheckRow, Notice, Stepper, type ButtonVariant } from '@/components/ui/confirm-parts';
import { XIcon } from '@/components/ui/icons';
import { CheckIcon } from '@/components/ui/icons-more';
import { initialActionState, type ActionState } from '@/lib/action-state';

const TONES = { warn: 'bg-warn-soft text-warn', expense: 'bg-expense-soft text-expense', accent: 'bg-accent-soft text-accent-text' } as const;

type Content = {
  tone?: keyof typeof TONES;
  icon: ReactNode;
  title: string;
  subtitle: string;
  /** Step 1: what will change. */
  review: ReactNode;
  /** Step 2, top: the one thing being approved, large. */
  summary?: ReactNode;
  /** Step 2: every box must be ticked before the confirm button unlocks. */
  checks: string[];
  notice?: ReactNode;
  confirmLabel: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Hidden form fields sent to `action`. */
  fields: Record<string, string>;
};

type ConfirmFlowProps = Content & {
  trigger: { label: string; variant?: ButtonVariant; size?: 'sm' | 'md'; icon?: ReactNode; disabled?: boolean; title?: string };
};

function FlowBody({ close, ...content }: Content & { close: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [ticks, setTicks] = useState(() => content.checks.map(() => false));
  const [state, formAction, pending] = useActionState(content.action, initialActionState);
  const done = Boolean(state.success);
  const ready = ticks.every(Boolean);

  return (
    <div className="flex flex-col gap-5 p-6">
      <header className="flex items-start gap-4 pr-10">
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${TONES[content.tone ?? 'warn']}`}>{content.icon}</span>
        <div className="min-w-0">
          <h2 className="text-lg leading-snug font-semibold tracking-tight">{content.title}</h2>
          <p className="mt-0.5 text-sm text-muted">{content.subtitle}</p>
        </div>
      </header>
      <Stepper step={step} done={done} />
      {step === 1 ? (
        <div className="rounded-2xl px-4 py-1 ring-1 ring-border">{content.review}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {content.summary ? <div className="rounded-2xl bg-surface-2/70 p-5">{content.summary}</div> : null}
          {content.checks.map((text, index) => (
            <CheckRow
              key={text}
              checked={ticks[index] ?? false}
              onChange={(value) => setTicks((prev) => prev.map((tick, i) => (i === index ? value : tick)))}
            >
              {text}
            </CheckRow>
          ))}
          {content.notice ? <Notice>{content.notice}</Notice> : null}
        </div>
      )}
      {state.error ? (
        <p role="alert" className="rounded-2xl bg-expense-soft px-4 py-3 text-sm text-expense">
          {state.error}
        </p>
      ) : null}
      <footer className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={close} className="mr-auto px-1 text-sm font-semibold text-muted hover:text-foreground">
          {done ? 'Хаах' : 'Цуцлах'}
        </button>
        {step === 2 && !done ? (
          <button type="button" onClick={() => setStep(1)} className={buttonClass('secondary')}>
            Буцах
          </button>
        ) : null}
        {step === 1 ? (
          <button type="button" onClick={() => setStep(2)} className={buttonClass('primary')}>
            Үргэлжлүүлэх
          </button>
        ) : done ? (
          <button type="button" onClick={close} role="status" className={buttonClass('success')}>
            <CheckIcon className="size-4" /> {state.success}
          </button>
        ) : (
          <form action={formAction}>
            {Object.entries(content.fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <button type="submit" disabled={!ready || pending} className={buttonClass('primary')}>
              <CheckIcon className="size-4" /> {pending ? 'Хадгалж байна…' : content.confirmLabel}
            </button>
          </form>
        )}
      </footer>
    </div>
  );
}

/**
 * A button that opens a two-step confirm dialog (review → tick the checks → confirm), for
 * admin actions that change other people's data. Each opening starts fresh.
 */
export function ConfirmFlow({ trigger, ...content }: ConfirmFlowProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(0);

  function open() {
    setOpened((count) => count + 1);
    ref.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
  }
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" onClick={open} disabled={trigger.disabled} title={trigger.title} className={buttonClass(trigger.variant ?? 'primary', trigger.size)}>
        {trigger.icon}
        {trigger.label}
      </button>
      <dialog
        ref={ref}
        aria-label={content.title}
        onClose={() => {
          document.documentElement.style.overflow = '';
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto rounded-[28px] bg-surface p-0 text-foreground shadow-pop backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]"
      >
        <button type="button" onClick={close} aria-label="Хаах" title="Хаах (Esc)" className="absolute top-5 right-5 grid size-9 place-items-center rounded-xl bg-surface-2 text-muted hover:text-foreground">
          <XIcon className="size-4" />
        </button>
        {opened > 0 ? <FlowBody key={opened} close={close} {...content} /> : null}
      </dialog>
    </>
  );
}
