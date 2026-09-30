import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { ApiError } from "@/libs/api/client";
import { readError } from "@/libs/utils/errors";

/** Last successful result per query key — lets pages render instantly when revisited. */
const queryStore = new Map<string, unknown>();

/** Forget every remembered query result (e.g. on logout). */
export function clearQueryStore() {
  queryStore.clear();
}

/** Read a remembered result without subscribing (rarely needed). */
export function peekQuery<T>(key: string) {
  return queryStore.get(key) as T | undefined;
}

type Loader<T> = (fresh: boolean, signal: AbortSignal) => Promise<T>;

type Options = {
  /**
   * Stable name for this query, including its parameters (e.g. `"leads"`, `` `lead:${id}` ``).
   * With a key the hook uses stale-while-revalidate: the last result for the key is shown
   * immediately (no loading state) and refreshed in the background.
   */
  key?: string;
};

/**
 * Load async data for a component, with loading / error state, request cancellation
 * (the loader receives an `AbortSignal`) and optional stale-while-revalidate via `key`.
 *
 * @example
 * const { data, isLoading, isRefreshing, error, reload } = useAsyncData(
 *   (fresh, signal) =>
 *     leadService.list({}, { cache: fresh ? "no-store" : "default", signal }).then((r) => r.data),
 *   [],
 *   { key: "leads" },
 * );
 */
export function useAsyncData<T>(loader: Loader<T>, deps: DependencyList, options: Options = {}) {
  const { key } = options;
  const [data, setData] = useState<T | undefined>(() => (key ? (queryStore.get(key) as T | undefined) : undefined));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(() => !(key && queryStore.has(key)));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loaderRef = useRef(loader);
  const keyRef = useRef(key);
  const controllerRef = useRef<AbortController | null>(null);
  const shownKeyRef = useRef(key);

  useEffect(() => {
    loaderRef.current = loader;
    keyRef.current = key;
  });

  const run = useCallback(async (fresh: boolean) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const currentKey = keyRef.current;

    // Switched to a different query (e.g. another detail id): show its remembered data, if any.
    if (currentKey !== shownKeyRef.current) {
      shownKeyRef.current = currentKey;
      const remembered = currentKey ? (queryStore.get(currentKey) as T | undefined) : undefined;
      setData(remembered);
      setIsLoading(remembered === undefined);
    }

    // Remembered data stays on screen while it refreshes; only a first load shows the loading state.
    if (currentKey && queryStore.has(currentKey)) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError("");

    try {
      const result = await loaderRef.current(fresh, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      if (currentKey) {
        queryStore.set(currentKey, result);
      }

      setData(result);
    } catch (err) {
      if (controller.signal.aborted || (err instanceof ApiError && err.isCanceled)) {
        return;
      }

      setError(readError(err));
    } finally {
      if (controllerRef.current === controller) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void run(false);
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);

  /** Re-run bypassing caches (Refresh buttons, after saves). */
  const reload = useCallback(() => run(true), [run]);

  /** Replace the data locally (optimistic updates); also updates the remembered result. */
  const updateData = useCallback((value: T | undefined | ((current: T | undefined) => T | undefined)) => {
    setData((current) => {
      const next = typeof value === "function" ? (value as (current: T | undefined) => T | undefined)(current) : value;
      const currentKey = keyRef.current;

      if (currentKey) {
        if (next === undefined) queryStore.delete(currentKey);
        else queryStore.set(currentKey, next);
      }

      return next;
    });
  }, []);

  return {
    data,
    setData: updateData,
    error,
    setError,
    /** First load with nothing to show yet (render a skeleton). */
    isLoading,
    /** Re-fetching while the previous data stays on screen. */
    isRefreshing,
    /** Any request in progress (use for Refresh-button spinners). */
    isFetching: isLoading || isRefreshing,
    reload,
  };
}
