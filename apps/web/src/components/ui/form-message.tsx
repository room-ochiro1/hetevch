import type { ActionState } from '@/lib/action-state';

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm text-expense">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="text-sm text-income">
        {state.success}
      </p>
    );
  }
  return null;
}
