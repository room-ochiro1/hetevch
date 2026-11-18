import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

/** Counts queries in flight, so a refresh can wait until the new data has actually arrived. */
export type LoadingTracker = {
  start: () => void;
  end: () => void;
  /** Calls `done` once nothing is loading (right away if nothing is). */
  whenIdle: (done: () => void) => void;
};

function createLoadingTracker(): LoadingTracker {
  let count = 0;
  let waiters: (() => void)[] = [];
  return {
    start: () => {
      count += 1;
    },
    end: () => {
      count = Math.max(0, count - 1);
      if (count === 0) {
        const ready = waiters;
        waiters = [];
        ready.forEach((done) => done());
      }
    },
    whenIdle: (done) => {
      if (count === 0) done();
      else waiters.push(done);
    },
  };
}

/** Never leave a refresh spinner up longer than this, even on a hung request. */
const REFRESH_TIMEOUT_MS = 10_000;

type FinanceDataState = {
  /** Bumped after every save, delete or pull-to-refresh; data hooks re-fetch when it changes. */
  version: number;
  /** Re-fetches everything; resolves when the new data has loaded. */
  invalidate: () => Promise<void>;
  loading: LoadingTracker;
};

const FinanceDataContext = createContext<FinanceDataState | null>(null);

export function FinanceDataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const [loading] = useState(createLoadingTracker);

  const invalidate = useCallback(() => {
    setVersion((current) => current + 1);
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, REFRESH_TIMEOUT_MS);
      // Let the re-render start the new queries, then wait for them to settle.
      setTimeout(() => {
        loading.whenIdle(() => {
          clearTimeout(timeout);
          resolve();
        });
      }, 50);
    });
  }, [loading]);

  const value = useMemo(() => ({ version, invalidate, loading }), [version, invalidate, loading]);
  return <FinanceDataContext value={value}>{children}</FinanceDataContext>;
}

export function useFinanceData(): FinanceDataState {
  const value = use(FinanceDataContext);
  if (!value) {
    throw new Error('useFinanceData must be used inside <FinanceDataProvider>');
  }
  return value;
}
