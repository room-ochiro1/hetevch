import { LogOutIcon } from '@/components/ui/icons';

import { signOut } from '@/lib/actions/sign-out';

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label={compact ? 'Гарах' : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-foreground"
      >
        <LogOutIcon />
        {compact ? null : 'Гарах'}
      </button>
    </form>
  );
}
