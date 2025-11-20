# React Query Usage with Tauri Commands

This document explains how to use the React Query integration for caching Tauri command results.

## Overview

We've integrated `@tanstack/react-query` to cache deterministic Tauri commands. This provides:

- **Stable promises** for React Suspense compatibility
- **Automatic caching** of command results based on time
- **Type safety** with full TypeScript support

## Available Hooks

### `useTauriQuery(command, ...args)`

Hook that immediately fetches and caches results from a Tauri command.

**Only works with deterministic commands**:
- `get_blame`
- `get_changes`
- `get_changes_between`
- `get_commit_detail`
- `get_content_base64`
- `get_tree`

TypeScript will prevent you from using non-deterministic commands with this hook.

```tsx
import { useTauriQuery } from "@/hooks/useTauriQuery";

function MyComponent({ repoPath, revspec }: Props) {
  const { data, isLoading, error } = useTauriQuery("get_commit_detail", { repoPath, revspec });

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  return <div>{data.message}</div>;
}
```

### `useTauriSuspenseQuery(command, ...args)`

Hook that immediately fetches with Suspense support.

**Only works with the same deterministic commands as `useTauriQuery`**.

**Use this for**: Components that use Suspense boundaries

```tsx
import { useTauriSuspenseQuery } from "@/hooks/useTauriQuery";

function CommitDetail({ repoPath, revspec }: Props) {
  const { data } = useTauriSuspenseQuery("get_commit_detail", { repoPath, revspec });
  // data is always defined - no need to check
  return <div>{data.message}</div>;
}

// Wrap with Suspense:
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <CommitDetail repoPath={path} revspec={hash} />
    </Suspense>
  );
}
```

## Real-World Examples

### Example 1: Fetching Commit Details with Suspense

```tsx
// Before (no caching):
import { invokeTauriCommand } from "@/invokeTauriCommand";

function CommitDiffTab({ repoPath, revspec }: Props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    invokeTauriCommand("get_commit_detail", { repoPath, revspec })
      .then(setData);
  }, [repoPath, revspec]);

  if (!data) return <Loading />;
  return <div>{data.message}</div>;
}

// After (with caching):
import { useTauriSuspenseQuery } from "@/hooks/useTauriQuery";

function CommitDiffTab({ repoPath, revspec }: Props) {
  const { data } = useTauriSuspenseQuery("get_commit_detail", { repoPath, revspec });
  return <div>{data.message}</div>;
}

// Wrap with Suspense in parent:
<Suspense fallback={<Loading />}>
  <CommitDiffTab repoPath={path} revspec={hash} />
</Suspense>
```

### Example 2: Regular Query with Loading State

```tsx
function CommitDetail({ repoPath, revspec }: Props) {
  const { data, isLoading, error } = useTauriQuery("get_commit_detail", { repoPath, revspec });

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  return <div>{data.message}</div>;
}
```

### Example 3: Conditional Fetching

```tsx
function MyComponent({ repoPath, revspec, enabled }: Props) {
  // Only fetch when enabled is true
  const { data } = useTauriQuery("get_commit_detail", { repoPath, revspec }, {
    enabled
  });

  return data ? <div>{data.message}</div> : <Empty />;
}
```

## Cache Management

The cache is managed automatically through time-based expiration:

- **`staleTime`**: How long cached data is considered fresh (default: 5 minutes)
- **`gcTime`**: How long unused data stays in cache (default: 10 minutes)

When you call a mutation command (like `commit`, `stage`, `reset`), simply continue using `invokeTauriCommand` directly. The cache will naturally expire based on the configured times.

```tsx
// Mutations don't need caching - use invokeTauriCommand directly
import { invokeTauriCommand } from "@/invokeTauriCommand";

function CommitButton({ repoPath }: Props) {
  const handleCommit = async () => {
    await invokeTauriCommand("commit", {
      repoPath,
      options: { message: "Initial commit", amend: false },
    });
    // Cached queries will expire naturally based on staleTime
  };

  return <button onClick={handleCommit}>Commit</button>;
}
```

## Configuration

The QueryClient is configured in `src/react/index.tsx`:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Don't refetch on window focus
      refetchOnReconnect: false,    // Don't refetch on reconnect
      staleTime: 5 * 60 * 1000,     // Cache for 5 minutes
      gcTime: 10 * 60 * 1000,       // Keep unused data for 10 minutes
      retry: false,                  // Don't retry failed queries
    },
  },
});
```

You can adjust these defaults based on your needs:
- For immutable data (git objects): increase `staleTime` to `Infinity`
- For frequently changing data (reflog): decrease `staleTime` to 1-2 seconds
- Adjust `gcTime` to control memory usage

## Best Practices

1. **Use `useTauriSuspenseQuery` with Suspense boundaries** for the best user experience
2. **Use `useTauriQuery` for non-Suspense async operations**
3. **Prefetch data on hover** to make the UI feel instant
4. **Use `invokeTauriCommand` directly for mutations** - no need to cache them
5. **Adjust `staleTime` based on data mutability** - immutable data can be cached forever
