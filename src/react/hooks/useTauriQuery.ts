import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { TauriInvokeType } from "@/generated/tauri-invoke";
import { invokeTauriCommand } from "@/invokeTauriCommand";

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
  "get_tree"
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
 * Hook for executing custom query logic with multiple Tauri commands with Suspense support.
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
 * @param queryKey - Unique key for this combined query
 * @param queryFn - Async function that receives an `invoke` function to call Tauri commands
 *
 * @example
 * ```tsx
 * function CommitComparison({ repoPath, revspec1, revspec2 }: Props) {
 *   // Fetch two commit details in parallel - no waterfall!
 *   const { data } = useTauriSuspenseInvoke(
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
export function useTauriSuspenseInvoke<T>(
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
