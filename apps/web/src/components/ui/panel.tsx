import type { ReactNode } from 'react';

type PanelProps = {
  title?: string;
  description?: string;
  /** Top-right slot: a period pill, a count, a link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Removes inner padding, e.g. for edge-to-edge tables. */
  flush?: boolean;
};

/** The white card every section lives in. */
export function Panel({ title, description, action, children, className = '', flush }: PanelProps) {
  return (
    <section className={`flex flex-col rounded-3xl bg-surface shadow-card ${className}`}>
      {title ? (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
            {description ? <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={flush ? 'mt-4 min-w-0' : 'min-w-0 flex-1 p-5 sm:px-6'}>{children}</div>
    </section>
  );
}
