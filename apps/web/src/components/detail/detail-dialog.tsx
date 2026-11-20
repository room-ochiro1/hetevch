'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

import { XIcon } from '@/components/ui/icons';

type DetailDialogProps = {
  /** Accessible name of the dialog (its visible title lives in the content). */
  label: string;
  /** The page URL with the same filters and no dialog. */
  closeHref: string;
  children: ReactNode;
};

/**
 * The one drill-down dialog. A native <dialog> opened with showModal(), so focus is trapped,
 * the page behind is inert and Escape works. Closing (Escape, ✕, a click outside) drops
 * `?detail=` from the URL; links inside swap the content in place, and Back steps back.
 */
export function DetailDialog({ label, closeHref, children }: DetailDialogProps) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  function close() {
    ref.current?.close();
    router.replace(closeHref, { scroll: false });
  }

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(64rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] bg-background p-0 text-foreground shadow-pop backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]"
    >
      <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col">
        <button
          type="button"
          onClick={close}
          aria-label="Хаах"
          title="Хаах (Esc)"
          className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-xl bg-surface text-muted shadow-card hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-7">{children}</div>
      </div>
    </dialog>
  );
}
