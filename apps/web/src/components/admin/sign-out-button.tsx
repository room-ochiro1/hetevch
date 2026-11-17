import { signOut } from '@/lib/actions/sign-out';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-background"
      >
        Гарах
      </button>
    </form>
  );
}
