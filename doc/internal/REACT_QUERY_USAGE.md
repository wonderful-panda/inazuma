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

### `useTauriQueryInvoke()`

Hook that returns a stable invoke function for **imperative** Tauri command fetching with query cache.

**Only works with the same deterministic commands as `useTauriQuery`**.

**Use this for**: Event handlers, callbacks, or any imperative data fetching scenario where you can't use declarative hooks.

The returned function:
- Checks the cache first and reuses cached results when available
- Is stable across renders (safe to use in dependency arrays)
- Returns a Promise that resolves to the command result

```tsx
import { useTauriQueryInvoke } from "@/hooks/useTauriQuery";

function CommitDialog({ repoPath }: Props) {
  const [message, setMessage] = useState("");
  const invoke = useTauriQueryInvoke();

  const handleAmendChange = async (checked: boolean) => {
    if (checked) {
      // Fetch commit detail imperatively in event handler
      const detail = await invoke("get_commit_detail", { repoPath, revspec: "HEAD" });
      setMessage(detail.summary + (detail.body ? `\n\n${detail.body}` : ""));
    } else {
      setMessage("");
    }
  };

  return (
    <div>
      <Checkbox label="Amend" onChange={handleAmendChange} />
      <TextArea value={message} onChange={setMessage} />
    </div>
  );
}
```

**Key benefit**: Perfect for fetching data in response to user interactions (clicks, form changes, etc.) while still benefiting from React Query's caching.

### `useTauriComposeQuery(queryKey, queryFn)`

**Advanced hook** for composing multiple Tauri commands into a single query with **Suspense support**.

This is the most powerful hook when you need to:
- **Fetch multiple commands in parallel** - avoid sequential waterfalls
- **Compose complex queries** from multiple data sources
- **Share cached results** - each command call is cached individually

The `queryFn` receives an `invoke` function that you can call multiple times. Each `invoke` call is cached separately, so results can be reused across different components.

This version throws promises for Suspense boundaries.

**Only works with deterministic commands** (same as above).

```tsx
import { useTauriComposeQuery } from "@/hooks/useTauriQuery";

function CommitComparison({ repoPath, revspec1, revspec2 }: Props) {
  const { data } = useTauriComposeQuery(
    ["commit-comparison", repoPath, revspec1, revspec2],
    async (invoke) => {
      // Fetch all data in parallel - no waterfall!
      const [detail1, detail2, changes] = await Promise.all([
        invoke("get_commit_detail", { repoPath, revspec: revspec1 }),
        invoke("get_commit_detail", { repoPath, revspec: revspec2 }),
        invoke("get_changes_between", { repoPath, revspec1, revspec2 })
      ]);

      // Compose the final result
      return {
        commit1: detail1,
        commit2: detail2,
        changes,
        timeDiff: detail2.timestamp - detail1.timestamp
      };
    }
  );
  // data is always defined - no need to check

  return (
    <div>
      <h2>{data.commit1.message} vs {data.commit2.message}</h2>
      <p>{data.changes.length} files changed</p>
      <p>Time difference: {data.timeDiff}ms</p>
    </div>
  );
}

// Wrap with Suspense boundary:
<Suspense fallback={<Loading />}>
  <CommitComparison repoPath={path} revspec1={hash1} revspec2={hash2} />
</Suspense>
```

**Key benefit**: Each `invoke` call's result is cached individually. If another component calls `useTauriSuspenseQuery("get_commit_detail", { repoPath, revspec: revspec1 })`, it will get the cached result instantly!

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

### Example 3: Imperative Fetching in Event Handlers

```tsx
// Use useTauriQueryInvoke for fetching in response to user actions
import { useTauriQueryInvoke } from "@/hooks/useTauriQuery";

function CommitDialog({ repoPath }: Props) {
  const [message, setMessage] = useState("");
  const [isAmend, setIsAmend] = useState(false);
  const invoke = useTauriQueryInvoke();
  const { reportError } = useAlert();

  const handleAmendChange = async (checked: boolean) => {
    setIsAmend(checked);
    if (checked) {
      try {
        // Fetch HEAD commit message imperatively
        const detail = await invoke("get_commit_detail", { repoPath, revspec: "HEAD" });
        setMessage(detail.summary + (detail.body ? `\n\n${detail.body}` : ""));
      } catch (error) {
        reportError({ error });
      }
    } else {
      setMessage("");
    }
  };

  return (
    <Dialog>
      <TextField value={message} onChange={setMessage} multiline />
      <Checkbox
        label="Amend last commit"
        checked={isAmend}
        onChange={handleAmendChange}
      />
    </Dialog>
  );
}
```

### Example 4: Conditional Fetching

```tsx
function MyComponent({ repoPath, revspec, enabled }: Props) {
  // Only fetch when enabled is true
  const { data } = useTauriQuery("get_commit_detail", { repoPath, revspec }, {
    enabled
  });

  return data ? <div>{data.message}</div> : <Empty />;
}
```

### Example 5: Avoiding Request Waterfalls with useTauriComposeQuery

```tsx
// ❌ BAD: Sequential waterfall - second query waits for first
function BadExample({ repoPath, revspec }: Props) {
  const { data: detail } = useTauriSuspenseQuery("get_commit_detail", { repoPath, revspec });
  const { data: changes } = useTauriSuspenseQuery("get_changes", { repoPath, revspec });
  // changes query doesn't start until detail finishes!
}

// ✅ GOOD: Parallel fetching - no waterfall
function GoodExample({ repoPath, revspec }: Props) {
  const { data } = useTauriComposeQuery(
    ["commit-with-changes", repoPath, revspec],
    async (invoke) => {
      // Both requests fire in parallel!
      const [detail, changes] = await Promise.all([
        invoke("get_commit_detail", { repoPath, revspec }),
        invoke("get_changes", { repoPath, revspec })
      ]);
      return { detail, changes };
    }
  );
  // data is always defined - no need to check
  return <CommitView detail={data.detail} changes={data.changes} />;
}

// Wrap with Suspense boundary:
<Suspense fallback={<Loading />}>
  <GoodExample repoPath={path} revspec={hash} />
</Suspense>
```

### Example 6: Complex Data Composition

```tsx
function EnrichedCommitView({ repoPath, revspec, parentRevspec }: Props) {
  const { data } = useTauriComposeQuery(
    ["enriched-commit", repoPath, revspec, parentRevspec],
    async (invoke) => {
      // Fetch commit details for both revisions
      const [commit, parentCommit] = await Promise.all([
        invoke("get_commit_detail", { repoPath, revspec }),
        invoke("get_commit_detail", { repoPath, revspec: parentRevspec })
      ]);

      // Then fetch changes (depends on commit info, but runs after parallel fetch)
      const changes = await invoke("get_changes", { repoPath, revspec });

      // Fetch blame for first changed file
      const firstFile = changes[0];
      const blame = firstFile
        ? await invoke("get_blame", {
            repoPath,
            relPath: firstFile.path,
            revspec
          })
        : null;

      return {
        commit,
        parentCommit,
        changes,
        blame,
        summary: {
          filesChanged: changes.length,
          timeSinceParent: commit.timestamp - parentCommit.timestamp
        }
      };
    }
  );
  // data is always defined - no need to check
  return <DetailedCommitView data={data} />;
}

// Wrap with Suspense boundary:
<Suspense fallback={<Loading />}>
  <EnrichedCommitView repoPath={path} revspec={hash} parentRevspec={parentHash} />
</Suspense>
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
3. **Use `useTauriQueryInvoke` for imperative fetching** in event handlers and callbacks
4. **Use `useTauriComposeQuery` when fetching multiple commands** - avoids request waterfalls and maximizes parallelization
5. **Use `invokeTauriCommand` directly for mutations** - no need to cache them
6. **Adjust `staleTime` based on data mutability** - immutable data can be cached forever

### When to use each hook:

- **Single command fetch (declarative)**: Use `useTauriQuery` or `useTauriSuspenseQuery`
- **Single command fetch (imperative)**: Use `useTauriQueryInvoke()` for event handlers and callbacks
- **Multiple commands in parallel**: Use `useTauriComposeQuery` with `Promise.all`
- **Complex data composition**: Use `useTauriComposeQuery` for maximum flexibility
- **Mutations**: Use `invokeTauriCommand` directly (no caching)
