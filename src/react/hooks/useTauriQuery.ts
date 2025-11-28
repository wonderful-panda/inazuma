import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import type { TauriInvokeType } from "@/generated/tauri-invoke";

/**
 * Deterministic Tauri commands that are safe to cache.
 * These commands have no side effects and their results are deterministic.
 */
const deterministicTauriCommandNames = [
  "get_blame",
  "get_changes",
  "get_changes_between",
  "get_commit_detail",
  "get_content_base64",
  "get_tree",
  "get_last_modify_commit"
] as const satisfies (keyof TauriInvokeType)[];

export type DeterministicTauriCommand = (typeof deterministicTauriCommandNames)[number];
export type DeterministicTauriInvoke = <K extends DeterministicTauriCommand>(
  command: K,
  ...args: TauriInvokeType[K]["args"]
) => Promise<TauriInvokeType[K]["ret"]>;

/**
 * Creates a query key for a Tauri command.
 * This ensures consistent cache keys across the application.
 */
export function createTauriQueryKey<K extends DeterministicTauriCommand>(
  command: K,
  args: TauriInvokeType[K]["args"]
): unknown[] {
  return ["tauriCommand", command, ...args];
}

/**
 * Hook for querying Tauri commands with React Query caching.
 *
 * ONLY works with deterministic commands: get_blame, get_changes, get_changes_between,
 * get_commit_detail, get_content_base64, get_tree
 *
 * @example
 * ```tsx
 * function MyComponent({ repoPath, revspec }: Props) {
 *   const { data, isLoading, error } = useTauriQuery("get_commit_detail", { repoPath, revspec });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error error={error} />;
 *   return <div>{data.message}</div>;
 * }
 * ```
 */
export function useTauriQuery<K extends DeterministicTauriCommand>(
  command: K,
  ...args: TauriInvokeType[K]["args"]
) {
  return useQuery({
    queryKey: createTauriQueryKey(command, args),
    queryFn: () => invokeTauriCommand(command, ...args)
  });
}

/**
 * Hook for querying Tauri commands with Suspense support.
 * This version throws promises for Suspense boundaries.
 *
 * ONLY works with deterministic commands: get_blame, get_changes, get_changes_between,
 * get_commit_detail, get_content_base64, get_tree
 *
 * @example
 * ```tsx
 * function CommitDetail({ repoPath, revspec }: Props) {
 *   const { data } = useTauriSuspenseQuery("get_commit_detail", { repoPath, revspec });
 *   // data is always defined - no need to check
 *   return <div>{data.message}</div>;
 * }
 *
 * // Wrap with Suspense boundary:
 * <Suspense fallback={<Loading />}>
 *   <CommitDetail repoPath={path} revspec={hash} />
 * </Suspense>
 * ```
 */
export function useTauriSuspenseQuery<K extends DeterministicTauriCommand>(
  command: K,
  ...args: TauriInvokeType[K]["args"]
) {
  return useSuspenseQuery({
    queryKey: createTauriQueryKey(command, args),
    queryFn: () => invokeTauriCommand(command, ...args)
  });
}

/**
 * Hook that returns a stable invoke function for imperative Tauri command fetching with query cache.
 *
 * Use this hook when you need to fetch data imperatively (e.g., in event handlers, callbacks)
 * rather than declaratively. The returned function checks the cache first and reuses cached
 * results when available.
 *
 * ONLY works with deterministic commands: get_blame, get_changes, get_changes_between,
 * get_commit_detail, get_content_base64, get_tree
 *
 * @returns A stable invoke function that fetches and caches Tauri commands
 *
 * @example
 * ```tsx
 * function CommitDialog() {
 *   const invoke = useTauriQueryInvoke();
 *
 *   const handleAmendChange = async (checked: boolean) => {
 *     if (checked) {
 *       // Fetch commit detail imperatively in event handler
 *       const detail = await invoke("get_commit_detail", { repoPath, revspec: "HEAD" });
 *       setMessage(detail.summary);
 *     }
 *   };
 *
 *   return <Checkbox onChange={handleAmendChange} />;
 * }
 * ```
 */
export function useTauriQueryInvoke() {
  const queryClient = useQueryClient();
  const invoke: DeterministicTauriInvoke = useCallback(
    <K extends DeterministicTauriCommand>(command: K, ...args: TauriInvokeType[K]["args"]) => {
      return queryClient.fetchQuery({
        queryKey: createTauriQueryKey(command, args),
        queryFn: () => invokeTauriCommand(command, ...args)
      });
    },
    [queryClient]
  );
  return invoke;
}

/**
 * Hook for composing multiple Tauri commands into a single query with Suspense support.
 *
 * This hook provides an `invoke` function that can be called multiple times within the query function.
 * Each `invoke` call is cached individually, allowing you to:
 * - Call multiple commands in parallel (avoiding waterfalls)
 * - Compose complex queries from multiple data sources
 * - Share cached results across different queries
 *
 * This version throws promises for Suspense boundaries.
 *
 * ONLY works with deterministic commands: get_blame, get_changes, get_changes_between,
 * get_commit_detail, get_content_base64, get_tree
 *
 * @param queryKey - Unique key for this composed query
 * @param queryFn - Async function that receives an `invoke` function to call Tauri commands
 *
 * @example
 * ```tsx
 * function CommitComparison({ repoPath, revspec1, revspec2 }: Props) {
 *   // Fetch two commit details in parallel - no waterfall!
 *   const { data } = useTauriComposeQuery(
 *     ["commit-comparison", repoPath, revspec1, revspec2],
 *     async (invoke) => {
 *       // These run in parallel
 *       const [detail1, detail2] = await Promise.all([
 *         invoke("get_commit_detail", { repoPath, revspec: revspec1 }),
 *         invoke("get_commit_detail", { repoPath, revspec: revspec2 })
 *       ]);
 *
 *       return {
 *         commit1: detail1,
 *         commit2: detail2,
 *         timeDiff: detail2.timestamp - detail1.timestamp
 *       };
 *     }
 *   );
 *   // data is always defined - no need to check
 * }
 *
 * // Wrap with Suspense boundary:
 * <Suspense fallback={<Loading />}>
 *   <CommitComparison repoPath={path} revspec1={hash1} revspec2={hash2} />
 * </Suspense>
 * ```
 */
export function useTauriComposeQuery<T>(
  queryKey: readonly unknown[],
  queryFn: (invoke: DeterministicTauriInvoke) => Promise<T>
) {
  const queryClient = useQueryClient();
  const invoke: DeterministicTauriInvoke = <K extends DeterministicTauriCommand>(
    command: K,
    ...args: TauriInvokeType[K]["args"]
  ) => {
    return queryClient.fetchQuery({
      queryKey: createTauriQueryKey(command, args),
      queryFn: () => invokeTauriCommand(command, ...args)
    });
  };
  return useSuspenseQuery({
    queryKey,
    queryFn: () => queryFn(invoke)
  });
}
