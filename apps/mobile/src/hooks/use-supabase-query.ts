import { useEffect, useEffectEvent, useState } from 'react';

import { useFinanceData } from '@/providers/finance-data';

type QueryResponse<T> = { data: T | null; error: { message: string } | null };

export type QueryResult<T> = {
  /** Null until the query for the current key has answered. */
  data: T | null;
  error: string | null;
  /** True while the first load or a refresh for the current key is in flight. */
  loading: boolean;
};

type State<T> = { key: string | null; version: number; data: T | null; error: string | null };

/**
 * Runs a Supabase query and re-runs it when `key` changes or finance data is invalidated
 * (after a save or delete). Pass `key = null` to skip (e.g. no signed-in user yet).
 *
 * After an invalidation the previous data stays visible while the refresh loads. When the
 * key changes (another month, another record) old data is hidden: it describes something else.
 */
export function useSupabaseQuery<T>(
  key: string | null,
  run: () => PromiseLike<QueryResponse<T>>,
): QueryResult<T> {
  const { version, loading } = useFinanceData();
  const [state, setState] = useState<State<T>>({ key: null, version: -1, data: null, error: null });
  const runQuery = useEffectEvent(run);

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    // Report this request to the tracker so pull-to-refresh can wait for it. A superseded
    // request (cleanup ran first) stops counting right away.
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      loading.end();
    };
    loading.start();

    runQuery().then(
      ({ data, error }) => {
        settle();
        if (!cancelled) setState({ key, version, data, error: error?.message ?? null });
      },
      (reason: unknown) => {
        settle();
        if (cancelled) return;
        const message = reason instanceof Error ? reason.message : 'Сүлжээний алдаа гарлаа.';
        setState((previous) => ({
          key,
          version,
          data: previous.key === key ? previous.data : null,
          error: message,
        }));
      },
    );

    return () => {
      cancelled = true;
      settle();
    };
  }, [key, version, loading]);

  const sameKey = key !== null && state.key === key;
  return {
    data: sameKey ? state.data : null,
    error: sameKey ? state.error : null,
    loading: key !== null && (!sameKey || state.version !== version),
  };
}
