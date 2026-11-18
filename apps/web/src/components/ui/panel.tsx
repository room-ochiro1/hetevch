import type { ReactNode } from 'react';

type PanelProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Removes inner padding, e.g. for edge-to-edge tables. */
  flush?: boolean;
};

export function Panel({ title, description, action, children, className = '', flush }: PanelProps) {
  return (
    <section className={`rounded-2xl border border-border bg-surface ${className}`}>
      {title ? (
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={flush ? 'mt-4' : 'p-5'}>{children}</div>
    </section>
  );
}
