import { LogOutIcon } from '@/components/ui/icons';

import { signOut } from '@/lib/actions/sign-out';

/** `icon` = a square icon button (rail, mobile bar); otherwise a full-width button. */
export function SignOutButton({ icon = false }: { icon?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label="Гарах"
        title="Гарах"
        className={
          icon
            ? 'grid size-10 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground'
            : 'flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-foreground'
        }
      >
        <LogOutIcon />
        {icon ? null : 'Гарах'}
      </button>
    </form>
  );
}
