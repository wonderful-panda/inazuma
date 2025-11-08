import { useCallback } from "react";
import { useAlert } from "@/context/AlertContext";
import { useLoading } from "@/context/LoadingContext";

type TryUnwrapProimse<T> = T extends Promise<infer U> ? U : T;

export function useCallbackWithErrorHandler<T extends (...args: never[]) => unknown>(
  func: T,
  deps: unknown[],
  opt?: { loading?: boolean }
): (...args: Parameters<T>) => Promise<TryUnwrapProimse<ReturnType<T>> | "failed"> {
  const loading = useLoading();
  const { reportError } = useAlert();
  // biome-ignore lint/correctness/useExhaustiveDependencies(func): func is intentionally not in deps to allow stable callback reference
  return useCallback(
    async (...args: Parameters<T>) => {
      try {
        if (opt?.loading) {
          loading.show();
        }
        const ret = func(...args) as ReturnType<T>;
        if (ret instanceof Promise) {
          return (await ret) as TryUnwrapProimse<ReturnType<T>>;
        } else {
          return ret as TryUnwrapProimse<ReturnType<T>>;
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
    [...deps, opt?.loading, loading, reportError]
  );
}
