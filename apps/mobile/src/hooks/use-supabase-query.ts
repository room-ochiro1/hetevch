import { useEffect, useEffectEvent, useSyncExternalStore } from 'react';

import { useFinanceData } from '@/providers/finance-data';

type QueryResponse<T> = { data: T | null; error: { message: string } | null };

export type QueryResult<T> = {
  /** Null until the query for the current key has answered. */
  data: T | null;
  error: string | null;
  /** True while the first load or a refresh for the current key is in flight. */
  loading: boolean;
};

/** The last answer for a key, and which data version it belongs to. */
type Entry = { version: number; data: unknown; error: string | null };

const NETWORK_ERROR = 'Сүлжээний алдаа гарлаа.';

/*
 * One cache for every hook in the app, keyed by the query key (which always includes the user
 * id). It makes two things fast: components asking the same thing at the same time share one
 * request, and a screen that opens again shows its last answer at once while it refreshes.
 */
const answers = new Map<string, Entry>();
const inflight = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function store(key: string, entry: Entry) {
  // A slow answer for an older version must not replace a newer one.
  const current = answers.get(key);
  if (current && current.version > entry.version) return;
  answers.set(key, entry);
  listeners.forEach((listener) => listener());
}

/** Starts (or joins) the request for `key` at `version`; resolves once the answer is stored. */
function load<T>(key: string, version: number, run: () => PromiseLike<QueryResponse<T>>) {
  const id = `${key}@${version}`;
  const running = inflight.get(id);
  if (running) return running;
  const request = Promise.resolve(run())
    .then(
      ({ data, error }) => store(key, { version, data, error: error?.message ?? null }),
      (reason: unknown) =>
        // Offline or similar: keep whatever we had, with the error beside it.
        store(key, {
          version,
          data: answers.get(key)?.data ?? null,
          error: reason instanceof Error ? reason.message : NETWORK_ERROR,
        }),
    )
    .finally(() => inflight.delete(id));
  inflight.set(id, request);
  return request;
}

/**
 * Runs a Supabase query and re-runs it when `key` changes or finance data is invalidated
 * (after a save or delete). Pass `key = null` to skip (e.g. no signed-in user yet).
 *
 * While a refresh loads, the last answer for the same key stays visible, on this screen and on
 * any other that asks for it. A key never seen before shows nothing until it has answered: old
 * data for another month or record would describe something else.
 */
export function useSupabaseQuery<T>(
  key: string | null,
  run: () => PromiseLike<QueryResponse<T>>,
): QueryResult<T> {
  const { version, loading } = useFinanceData();
  const entry = useSyncExternalStore(subscribe, () => (key === null ? undefined : answers.get(key)));
  const runQuery = useEffectEvent(run);

  useEffect(() => {
    if (key === null) return;
    const current = answers.get(key);
    if (current && current.version === version && current.error === null) return;
    // Report this request to the tracker so pull-to-refresh can wait for it. A superseded
    // request (cleanup ran first) stops counting right away.
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      loading.end();
    };
    loading.start();
    load(key, version, runQuery).then(settle, settle);
    return settle;
  }, [key, version, loading]);

  if (key === null || !entry) return { data: null, error: null, loading: key !== null };
  const current = entry.version === version;
  return {
    // Shared across hooks with the same key; the key fixes the type, so the cast holds.
    data: entry.data as T | null,
    error: entry.error,
    // An answer for an older version is on screen while the new one loads.
    loading: !current,
  };
}
