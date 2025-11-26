# Tauri Commands Reference

This document provides comprehensive documentation for all Tauri commands available in the Inazuma application. These commands are exposed from the Rust backend to the frontend via Tauri's IPC mechanism.

## Table of Contents

- [Configuration & State Management](#configuration--state-management)
- [Repository Management](#repository-management)
- [Commit History & References](#commit-history--references)
- [Working Tree Operations](#working-tree-operations)
- [Branch Management](#branch-management)
- [Diff & Blame Operations](#diff--blame-operations)
- [File Operations](#file-operations)
- [PTY/Terminal Operations](#ptyterminal-operations)
- [Utility Commands](#utility-commands)

---

## Configuration & State Management

### `load_persist_data`

Loads persisted configuration and environment data from storage.

**Parameters:** None

**Returns:**
```typescript
Promise<[Config, Environment]>
```
- `Config`: User configuration settings
- `Environment`: Current environment state including recent opened repositories

**Usage:**
```typescript
const [config, env] = await invoke('load_persist_data');
```

**Description:**
Returns both the user configuration settings and the current environment state. This is typically called during application initialization to restore the previous session state.

---

### `store_recent_opened`

Stores the list of recently opened repositories.

**Parameters:**
- `new_list: string[]` - Vector of repository paths to store as recently opened

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('store_recent_opened', {
  newList: ['/path/to/repo1', '/path/to/repo2']
});
```

**Description:**
Updates the environment state with a new list of recently opened repository paths. This is used to maintain the "recent repositories" list in the UI.

---

### `store_state`

Stores arbitrary application state as key-value pairs.

**Parameters:**
- `new_state: Record<string, string>` - HashMap containing state key-value pairs to store

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('store_state', {
  newState: {
    'sidebar.width': '300',
    'theme': 'dark'
  }
});
```

**Description:**
Updates the environment state with a new state map, typically used for persisting UI state across sessions.

---

### `save_config`

Saves user configuration to persistent storage.

**Parameters:**
- `new_config: Config` - The configuration object to save

**Returns:** `Promise<void>`

**Errors:**
- Returns an error if the configuration cannot be saved to disk

**Usage:**
```typescript
await invoke('save_config', {
  newConfig: {
    theme: 'dark',
    externalDiffTool: '/usr/bin/meld'
  }
});
```

**Description:**
Persists the configuration settings to disk so they can be restored in future sessions.

---

## Repository Management

### `show_folder_selector`

Shows a native folder selection dialog.

**Parameters:** None

**Returns:** `Promise<string | null>`
- The selected folder path as a string (with forward slashes)
- `null` if the dialog was cancelled

**Usage:**
```typescript
const folderPath = await invoke('show_folder_selector');
if (folderPath) {
  console.log('Selected:', folderPath);
}
```

**Description:**
Opens a blocking folder picker dialog, allowing the user to select a directory. The path is normalized with forward slashes.

---

### `open_repository`

Opens a Git repository and starts watching for changes.

**Parameters:**
- `repo_path: string` - Path to the Git repository to open

**Returns:** `Promise<void>`

**Errors:**
- Returns an error if the repository cannot be opened or watching fails

**Usage:**
```typescript
await invoke('open_repository', {
  repoPath: '/path/to/repo'
});
```

**Description:**
Initializes the repository in the application state and sets up file watching to detect changes in the working directory. This must be called before other repository operations.

---

### `close_repository`

Closes a Git repository and stops watching for changes.

**Parameters:**
- `repo_path: string` - Path to the Git repository to close

**Returns:** `Promise<void>`

**Errors:**
- Returns an error if unwatching fails

**Usage:**
```typescript
await invoke('close_repository', {
  repoPath: '/path/to/repo'
});
```

**Description:**
Removes the file watcher for the repository, cleaning up resources. Should be called when the user closes a repository tab.

---

### `find_repository_root`

Finds the root directory of a Git repository.

**Parameters:** None

**Returns:** `Promise<string | null>`
- The path to the repository root
- `null` if not inside a Git repository

**Usage:**
```typescript
const rootPath = await invoke('find_repository_root');
if (rootPath) {
  console.log('Repository root:', rootPath);
}
```

**Description:**
Searches for a Git repository starting from the current directory and traversing up the directory tree. Useful for auto-detecting repositories.

---

## Commit History & References

### `fetch_history`

Fetches the commit history and references for a repository.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `max_count: number` - Maximum number of commits to fetch
- `reflog_count: number` - Maximum number of reflog entries to fetch

**Returns:**
```typescript
Promise<[Commit[], Refs]>
```
- `Commit[]`: List of commits
- `Refs`: All references including branches, tags, and reflog entries

**Usage:**
```typescript
const [commits, refs] = await invoke('fetch_history', {
  repoPath: '/path/to/repo',
  maxCount: 1000,
  reflogCount: 100
});
```

**Description:**
Retrieves the commit log along with all branches, tags, and reflog entries. The reflog entries are merged into the refs structure. This is the primary command for loading the commit graph.

---

### `get_current_branch`

Gets the name of the currently checked out branch.

**Parameters:**
- `repo_path: string` - Path to the Git repository

**Returns:** `Promise<string>`
- The name of the current branch

**Usage:**
```typescript
const branch = await invoke('get_current_branch', {
  repoPath: '/path/to/repo'
});
console.log('Current branch:', branch);
```

**Description:**
Returns the name of the currently checked out branch (e.g., "main", "develop").

---

### `get_reflog`

Gets the reflog entries for a repository.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `count: number` - Maximum number of reflog entries to retrieve

**Returns:** `Promise<[string, string][]>`
- Array of tuples containing (reference name, commit ID) pairs

**Usage:**
```typescript
const reflog = await invoke('get_reflog', {
  repoPath: '/path/to/repo',
  count: 50
});
```

**Description:**
Returns the reference log showing where branches and HEAD have pointed in the past. Useful for recovering lost commits or understanding branch history.

---

### `get_commit_detail`

Gets detailed information about a specific commit.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `revspec: string` - Git revision specification (commit hash, branch name, etc.)

**Returns:** `Promise<CommitDetail>`
- Detailed commit information including message, author, date, and changes

**Usage:**
```typescript
const detail = await invoke('get_commit_detail', {
  repoPath: '/path/to/repo',
  revspec: 'abc1234'
});
```

**Description:**
Returns comprehensive information about a specific commit, including metadata and file changes.

---

## Working Tree Operations

### `get_workingtree_stat`

Gets the status of the working tree.

**Parameters:**
- `repo_path: string` - Path to the Git repository

**Returns:** `Promise<WorkingTreeStat>`
- Working tree status containing files and their change statistics

**Usage:**
```typescript
const status = await invoke('get_workingtree_stat', {
  repoPath: '/path/to/repo'
});
```

**Description:**
Returns information about staged and unstaged changes, including file statistics (number of added/deleted lines) for each modified file. This is equivalent to `git status` with additional statistics.

---

### `stage`

Stages files for commit.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `rel_paths: string[]` - List of relative file paths to stage

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('stage', {
  repoPath: '/path/to/repo',
  relPaths: ['src/main.ts', 'README.md']
});
```

**Description:**
Adds the specified files to the staging area (index). Equivalent to `git add <files>`.

---

### `unstage`

Unstages files from the staging area.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `rel_paths: string[]` - List of relative file paths to unstage

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('unstage', {
  repoPath: '/path/to/repo',
  relPaths: ['src/main.ts']
});
```

**Description:**
Removes the specified files from the staging area (index) while keeping the changes in the working directory. Equivalent to `git restore --staged <files>`.

---

### `restore`

Restores files to their state in the index.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `rel_paths: string[]` - List of relative file paths to restore

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('restore', {
  repoPath: '/path/to/repo',
  relPaths: ['src/main.ts']
});
```

**Description:**
Discards changes in the working directory for the specified files, reverting them to their last committed or staged state. Equivalent to `git restore <files>`.

**Warning:** This operation cannot be undone!

---

### `commit`

Creates a Git commit with staged changes.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `options: CommitOptions` - Commit options including the commit message and amend flag

**CommitOptions:**
```typescript
type CommitOptions =
  | { Normal: { message: string } }
  | { Amend: { message: string | null } };
```

**Returns:** `Promise<void>`

**Usage:**
```typescript
// Normal commit
await invoke('commit', {
  repoPath: '/path/to/repo',
  options: { Normal: { message: 'Fix bug in parser' } }
});

// Amend with new message
await invoke('commit', {
  repoPath: '/path/to/repo',
  options: { Amend: { message: 'Updated commit message' } }
});

// Amend without changing message
await invoke('commit', {
  repoPath: '/path/to/repo',
  options: { Amend: { message: null } }
});
```

**Description:**
Can create a new commit or amend the last commit depending on the options.

---

## Branch Management

### `create_branch`

Creates a new Git branch.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `options: CreateBranchOptions` - Branch creation options including name and starting point

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('create_branch', {
  repoPath: '/path/to/repo',
  options: {
    name: 'feature/new-feature',
    startPoint: 'main'
  }
});
```

**Description:**
Creates a new branch at the specified starting point. Does not switch to the new branch automatically.

---

### `delete_branch`

Deletes a Git branch.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `options: DeleteBranchOptions` - Branch deletion options including name and force flag

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('delete_branch', {
  repoPath: '/path/to/repo',
  options: {
    name: 'feature/old-feature',
    force: false
  }
});
```

**Description:**
Deletes the specified branch. Use `force: true` to delete branches with unmerged changes.

---

### `switch`

Switches to a different branch or commit.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `options: SwitchOptions` - Switch options including target branch/commit

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('switch', {
  repoPath: '/path/to/repo',
  options: {
    target: 'feature/new-feature'
  }
});
```

**Description:**
Switches the working tree to a different branch or commit. Equivalent to `git switch <branch>`.

---

### `reset`

Resets the current branch to a specific commit.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `options: ResetOptions` - Reset options including target commit and reset mode (soft/mixed/hard)

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('reset', {
  repoPath: '/path/to/repo',
  options: {
    target: 'HEAD~1',
    mode: 'soft' // 'soft' | 'mixed' | 'hard'
  }
});
```

**Description:**
Resets the current branch to a specific commit. The mode determines what happens to the working tree and staging area:
- `soft`: Only moves HEAD, keeps changes staged
- `mixed`: Moves HEAD and unstages changes, keeps working tree
- `hard`: Moves HEAD, discards all changes

**Warning:** `hard` mode cannot be undone!

---

### `get_remote_list`

Gets the list of configured remote repositories.

**Parameters:**
- `repo_path: string` - Path to the Git repository

**Returns:** `Promise<string[]>`
- List of remote names (e.g., "origin", "upstream")

**Usage:**
```typescript
const remotes = await invoke('get_remote_list', {
  repoPath: '/path/to/repo'
});
console.log('Remotes:', remotes);
```

**Description:**
Returns the names of all configured remote repositories.

---

## Diff & Blame Operations

### `get_blame`

Gets blame information for a file.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `rel_path: string` - Relative path to the file within the repository
- `revspec: string` - Git revision specification to blame at

**Returns:** `Promise<Blame>`
- Blame data including entries, commits, and base64-encoded file content

**Usage:**
```typescript
const blame = await invoke('get_blame', {
  repoPath: '/path/to/repo',
  relPath: 'src/main.ts',
  revspec: 'HEAD'
});
```

**Description:**
Returns line-by-line authorship information, commit history for the file, and the file content. Used for the blame view to show who last modified each line.

---

### `get_changes_between`

Gets the file changes between two revisions.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `revspec1: string` - First Git revision specification
- `revspec2: string` - Second Git revision specification

**Returns:** `Promise<FileEntry[]>`
- List of files that changed between the two revisions

**Usage:**
```typescript
const changes = await invoke('get_changes_between', {
  repoPath: '/path/to/repo',
  revspec1: 'main',
  revspec2: 'feature/new-feature'
});
```

**Description:**
Compares two commits/branches and returns the list of files that changed. Useful for comparing branches or viewing changes in a range.

---

### `get_changes`

Gets the file changes introduced by a commit.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `revspec: string` - Git revision specification

**Returns:** `Promise<FileEntry[]>`
- List of files changed in the commit

**Errors:**
- Returns an error if the parent commit is not found

**Usage:**
```typescript
const changes = await invoke('get_changes', {
  repoPath: '/path/to/repo',
  revspec: 'abc1234'
});
```

**Description:**
Compares the commit with its parent to show what was changed. This is what you see when viewing a specific commit.

---

### `get_workingtree_udiff_base64`

Gets the unified diff for a file in the working tree, encoded as base64.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `rel_path: string` - Relative path to the file within the repository
- `cached: boolean` - If true, get diff of staged changes; if false, get unstaged changes

**Returns:** `Promise<string>`
- Base64-encoded unified diff

**Usage:**
```typescript
const diff = await invoke('get_workingtree_udiff_base64', {
  repoPath: '/path/to/repo',
  relPath: 'src/main.ts',
  cached: false
});
const decodedDiff = atob(diff);
```

**Description:**
Returns the unified diff (patch format) for a file in the working tree. Set `cached: true` for staged changes, `false` for unstaged changes.

---

### `show_external_diff`

Opens an external diff tool to compare two file versions.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `left: FileSpec` - Left file specification (revision and path)
- `right: FileSpec` - Right file specification (revision and path)

**Returns:** `Promise<void>`

**Errors:**
- Returns an error if no external diff tool is configured
- Returns an error if the repository is not opened

**Usage:**
```typescript
await invoke('show_external_diff', {
  repoPath: '/path/to/repo',
  left: { revspec: 'HEAD~1', path: 'src/main.ts' },
  right: { revspec: 'HEAD', path: 'src/main.ts' }
});
```

**Description:**
Prepares temporary files for both versions and launches the configured external diff tool. The temporary files are watched for changes to detect edits made in the external tool.

---

## File Operations

### `get_content_base64`

Gets file content at a specific revision, encoded as base64.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `rel_path: string` - Relative path to the file within the repository
- `revspec: string` - Git revision specification to retrieve content from

**Returns:** `Promise<string>`
- Base64-encoded file content

**Usage:**
```typescript
const content = await invoke('get_content_base64', {
  repoPath: '/path/to/repo',
  relPath: 'src/main.ts',
  revspec: 'HEAD'
});
const decodedContent = atob(content);
```

**Description:**
Retrieves the content of a file at a specific commit. Returns base64-encoded data to safely handle binary files.

---

### `get_tree`

Gets the directory tree at a specific revision.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `revspec: string` - Git revision specification

**Returns:** `Promise<LstreeEntry[]>`
- List of entries in the tree (files and directories)

**Usage:**
```typescript
const tree = await invoke('get_tree', {
  repoPath: '/path/to/repo',
  revspec: 'HEAD'
});
```

**Description:**
Returns the complete directory tree at a specific commit. Useful for browsing repository contents at any point in history.

---

### `get_last_modify_commit`

Gets the commit that last modified a file at or before a specified revision.

**Parameters:**
- `repo_path: string` - Path to the Git repository
- `rel_path: string` - Relative path to the file within the repository
- `revspec: string` - Git revision specification (commit hash, branch name, etc.)

**Returns:** `Promise<Commit | undefined>`
- The full commit object of the latest commit that meets the following conditions:
  - The specified file was changed in that commit
  - The commit is either the one specified by revspec or one of its ancestors
- `undefined` if no commits are found that modified the file

**Usage:**
```typescript
const commit = await invoke('get_last_modify_commit', {
  repoPath: '/path/to/repo',
  relPath: 'src/main.ts',
  revspec: 'abc1234'
});

if (commit) {
  console.log(`Last modified by ${commit.author} in ${commit.id}`);
} else {
  console.log('File not found in history');
}
```

**Description:**
Finds the most recent commit that modified the specified file, searching from the given revision backwards through the commit history. Returns the complete commit object including ID, author, email, date, message, and parent IDs. Returns `undefined` if no commits are found (e.g., for newly added files or files that don't exist at the specified revision).

---

## PTY/Terminal Operations

### `open_pty`

Opens a pseudo-terminal (PTY) and executes a command.

**Parameters:**
- `id: number` - Unique identifier for this PTY session
- `command_line: string` - Command to execute in the PTY
- `cwd: string` - Working directory for the command
- `rows: number` - Number of rows in the terminal
- `cols: number` - Number of columns in the terminal

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('open_pty', {
  id: 1,
  commandLine: 'bash',
  cwd: '/path/to/repo',
  rows: 24,
  cols: 80
});
```

**Events:**
- `pty-data:{id}` - Emitted when the PTY outputs data
- `pty-exit:{id}` - Emitted when the PTY process exits

**Description:**
Creates a new PTY session and runs the specified command in it. Output is emitted via Tauri events. Used for the integrated terminal feature.

---

### `write_pty`

Writes data to a running PTY session.

**Parameters:**
- `id: number` - PTY session identifier
- `data: string` - Data to write to the PTY

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('write_pty', {
  id: 1,
  data: 'git status\n'
});
```

**Description:**
Sends input to the pseudo-terminal, simulating user input. Used to send commands and keystrokes to the terminal.

---

### `close_pty`

Closes a PTY session and terminates the running process.

**Parameters:**
- `id: number` - PTY session identifier

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('close_pty', { id: 1 });
```

**Description:**
Terminates the PTY process and cleans up resources. Should be called when the user closes a terminal tab.

---

### `resize_pty`

Resizes a PTY session.

**Parameters:**
- `id: number` - PTY session identifier
- `rows: number` - New number of rows
- `cols: number` - New number of columns

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('resize_pty', {
  id: 1,
  rows: 30,
  cols: 100
});
```

**Description:**
Updates the terminal dimensions for a running PTY session. Should be called when the terminal UI is resized.

---

### `exec_git_with_pty`

Executes a Git command in a PTY session.

**Parameters:**
- `id: number` - Unique identifier for this PTY session
- `repo_path: string | null` - Optional path to the Git repository
- `command: string` - Git subcommand to execute
- `args: string[]` - Arguments to pass to the Git command
- `rows: number` - Number of rows in the terminal
- `cols: number` - Number of columns in the terminal

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('exec_git_with_pty', {
  id: 2,
  repoPath: '/path/to/repo',
  command: 'push',
  args: ['origin', 'main'],
  rows: 24,
  cols: 80
});
```

**Description:**
Constructs a Git command line and runs it in a new PTY session, allowing for interactive Git operations with terminal output. Useful for operations that require user interaction (e.g., push with credentials, interactive rebase).

---

## Utility Commands

### `yank_text`

Copies text to the system clipboard.

**Parameters:**
- `text: string` - The text to copy to the clipboard

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('yank_text', {
  text: 'abc123def456'
});
```

**Description:**
Copies the specified text to the system clipboard. Used for "copy commit hash" and similar features.

---

### `get_user_info`

Gets the configured Git user information.

**Parameters:**
- `repo_path: string` - Path to the Git repository

**Returns:** `Promise<GitUser>`
- Git user information containing name and email

**Usage:**
```typescript
const user = await invoke('get_user_info', {
  repoPath: '/path/to/repo'
});
console.log(`${user.name} <${user.email}>`);
```

**Description:**
Retrieves the user.name and user.email from the Git configuration. This is used to display who will be the author of commits.

---

### `get_system_fonts`

Gets a list of all fonts installed on the system.

**Parameters:** None

**Returns:** `Promise<Font[]>`
- List of fonts with their names and properties (including monospace flag)

**Usage:**
```typescript
const fonts = await invoke('get_system_fonts');
const monospaceFonts = fonts.filter(f => f.monospace);
```

**Description:**
Scans the system for available fonts and returns their metadata, sorted alphabetically by full name. Used for font selection in settings.

---

### `set_window_title`

Sets the application window title.

**Parameters:**
- `title: string` - The new window title

**Returns:** `Promise<void>`

**Usage:**
```typescript
await invoke('set_window_title', {
  title: 'Inazuma - my-repo (main)'
});
```

**Description:**
Updates the native window title. Used to display the current repository and branch in the window title bar.

---

## Type Definitions

### Common Types

```typescript
interface Config {
  theme?: 'light' | 'dark';
  externalDiffTool?: string;
  // ... other config fields
}

interface Environment {
  recentOpened: string[];
  state: Record<string, string>;
}

interface Commit {
  id: string;
  message: string;
  author: string;
  email: string;
  timestamp: number;
  parentIds: string[];
}

interface Refs {
  refs: Ref[];
}

type Ref =
  | { Branch: { id: string; name: string; fullname: string } }
  | { RemoteBranch: { id: string; name: string; fullname: string } }
  | { Tag: { id: string; name: string; fullname: string } }
  | { Reflog: { id: string; name: string; fullname: string; index: number } };

interface WorkingTreeStat {
  files: WorkingTreeFile[];
  parentIds: string[];
}

interface WorkingTreeFile {
  path: string;
  kind: 'Staged' | 'Unstaged' | 'Untracked' | 'Conflicted';
  status: string;
  delta?: { added: number; deleted: number };
}

interface CommitDetail {
  commit: Commit;
  files: FileEntry[];
  diff?: string;
}

interface FileEntry {
  path: string;
  oldPath?: string;
  status: 'Added' | 'Modified' | 'Deleted' | 'Renamed' | 'Copied';
}

interface Blame {
  blameEntries: BlameEntry[];
  commits: Commit[];
  contentBase64: string;
}

interface BlameEntry {
  commitId: string;
  lineNumber: number;
}

interface LstreeEntry {
  mode: string;
  type: 'blob' | 'tree';
  id: string;
  path: string;
  size?: number;
}

interface FileSpec {
  revspec: string;
  path: string;
}

interface GitUser {
  name: string;
  email: string;
}

interface Font {
  fullName: string;
  familyName: string;
  monospace: boolean;
}
```

---

## Error Handling

All commands return `Promise<T>` where `T` is either `void` or a specific type. Errors are returned as rejected promises with string error messages.

**Example:**
```typescript
try {
  await invoke('commit', {
    repoPath: '/path/to/repo',
    options: { Normal: { message: 'Fix bug' } }
  });
} catch (error) {
  console.error('Commit failed:', error);
  // error is a string describing what went wrong
}
```

---

## Best Practices

1. **Always open repositories before operations**: Call `open_repository` before performing any Git operations on a repository.

2. **Close repositories when done**: Call `close_repository` to clean up file watchers and free resources.

3. **Handle errors appropriately**: All commands can fail. Always wrap calls in try-catch blocks.

4. **Use appropriate revision specs**: Commands accept Git revision specifications (commit hashes, branch names, `HEAD`, `HEAD~1`, etc.).

5. **Base64 encoding**: Commands that return binary data (file contents, diffs) use base64 encoding. Remember to decode on the frontend.

6. **PTY session management**: Each PTY session needs a unique ID. Clean up PTY sessions with `close_pty` when done.

7. **Path format**: Always use forward slashes in paths, even on Windows. The backend handles conversion.

---

## Implementation Details

All commands are implemented in `src-tauri/app/src/commands.rs` and are exposed to the frontend via Tauri's `#[tauri::command]` macro. The commands use async operations and communicate with the Git repository through the `git` module.
