import { Atom, createStore } from "jotai";
import { useCallback } from "react";
import { useLoading, useReportError } from "./root";

export type Store = ReturnType<typeof createStore>;

export function createWacher<T>(atom: Atom<T>, store: Store) {
  return (handler: (value: T) => void) =>
    store.sub(atom, () => {
      const value = store.get(atom);
      handler(value);
    });
}

type TryUnwrapProimse<T> = T extends Promise<infer U> ? U : T;

export function useCallbackWithErrorHandler<T extends (...args: any[]) => unknown>(
  func: T,
  deps: unknown[],
  opt?: { loading?: boolean }
): (...args: Parameters<T>) => Promise<TryUnwrapProimse<ReturnType<T>> | "failed"> {
  const loading = useLoading();
  const reportError = useReportError();
  return useCallback(
    async (...args: Parameters<T>) => {
      try {
        if (opt?.loading) {
          loading.show();
        }
        const ret = func(...args);
        if (ret instanceof Promise) {
          return await ret;
        } else {
          return ret;
        }
      } catch (error) {
        reportError({ error });
        return "failed";
      } finally {
        if (opt?.loading) {
          loading.hide();
        }
      }
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [...deps, opt?.loading, loading]
  );
}
