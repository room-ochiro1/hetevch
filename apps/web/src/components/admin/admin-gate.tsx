import type { ReactNode } from 'react';

import { requireAdmin } from '@/lib/dal/auth';

/** Renders children only for admins; everyone else is redirected by requireAdmin(). */
export async function AdminGate({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}
