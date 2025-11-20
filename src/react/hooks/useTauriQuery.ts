import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
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

/**
 * Creates a query key for a Tauri command.
 * This ensures consistent cache keys across the application.
 */
export function createTauriQueryKey<K extends DeterministicTauriCommand>(
  command: K,
  args: TauriInvokeType[K]["args"]
): [K, ...TauriInvokeType[K]["args"]] {
  return [command, ...args];
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
