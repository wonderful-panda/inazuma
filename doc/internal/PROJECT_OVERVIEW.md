# Inazuma - Git Repository Browser

## Project Overview

Inazuma is a Git repository browser built with Tauri (Rust backend) and React (TypeScript frontend). It provides a rich GUI for browsing Git repositories with features like commit history visualization, blame view, tree browsing, interactive shell integration, and commit comparisons.

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Jotai (atomic state management)
- **Data Fetching**: TanStack Query (React Query)
- **UI Library**: Material-UI (MUI) with Emotion for styling
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Terminal**: xterm.js
- **Virtualization**: react-window for efficient list rendering
- **Linting/Formatting**: Biome

### Backend
- **Framework**: Tauri 2
- **Language**: Rust (edition 2021, min version 1.80)
- **Async Runtime**: Tokio
- **Serialization**: Serde
- **Type Generation**: ts-rs (Rust types to TypeScript)
- **Plugins**:
  - tauri-plugin-dialog
  - tauri-plugin-fs
  - tauri-plugin-clipboard-manager
  - tauri-plugin-log
  - tauri-plugin-http
- **Additional**: portable-pty for terminal emulation, font-kit for fonts, notify for file watching

## Project Structure

```
inazuma/
├── src/                          # Frontend source
│   └── react/                    # React application
│       ├── commands/             # Tauri command wrappers
│       ├── components/           # React components
│       │   ├── hoc/             # Higher-order components
│       │   ├── home/            # Home screen components
│       │   └── repository/       # Main repository view components
│       ├── context/              # React contexts
│       ├── generated/            # Auto-generated TypeScript types
│       ├── hooks/                # Custom React hooks
│       │   └── actions/         # Action hooks (workingtree, push, fetch, etc.)
│       ├── monaco/               # Monaco editor integration
│       ├── state/                # Jotai atoms and state management
│       │   └── repository/      # Repository-specific state
│       └── types/                # TypeScript type definitions
│
├── src-tauri/                    # Backend source
│   ├── app/                      # Main application crate
│   │   ├── src/
│   │   │   ├── git/             # Git operations (blame, log, diff, etc.)
│   │   │   ├── state/           # Application state management
│   │   │   ├── commands.rs      # Tauri command definitions
│   │   │   ├── lib.rs           # Library entry point
│   │   │   ├── pty.rs           # Pseudo-terminal implementation
│   │   │   └── platform.rs      # Platform-specific code
│   │   └── capabilities/         # Tauri security capabilities
│   ├── types/                    # Shared types with ts-rs attributes
│   │   └── src/lib.rs           # Type definitions (exported to TS)
│   └── generate/                 # Code generation utilities
│
├── build/                        # Build scripts
├── dist/                         # Build output (frontend)
└── target/                       # Rust build artifacts
```

## Key Architecture Patterns

### Type Safety Between Rust and TypeScript

The project uses **ts-rs** to automatically generate TypeScript types from Rust structs. This ensures type safety across the frontend-backend boundary.

- Rust types are defined in `src-tauri/types/src/lib.rs` with `#[derive(TS)]` and `#[ts(export)]`
- Generated TypeScript types are output to `src-tauri/types/bindings/`
- Frontend imports these types via the `@backend` alias

Example:
```rust
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Commit {
    pub id: String,
    pub parent_ids: Vec<String>,
    pub author: String,
    // ...
}
```

### Tauri Commands

Backend functionality is exposed through Tauri commands in `src-tauri/app/src/commands.rs`. These are invoked from the frontend using generated TypeScript wrappers.

Key command categories:
- Repository operations (open, close, get refs)
- Git operations (log, blame, diff, commit, branch operations)
- File operations (read content, show diff)
- Configuration management
- Terminal/PTY operations
- External diff tool integration

Typesafe invoker is generated in build step. See `GENERATE_BINDINGS.md` and `REACT_QUERY_USAGE.md` for details.

**Important**: Maintain `TAURI_COMMANDS.md` when some tauri command has been added, modified or deleted.

### State Management

**Jotai** is used for state management with atomic state updates:
- Global atoms in `src/react/state/`
- Repository-specific atoms in `src/react/state/repository/`
- Uses Jotai DevTools for debugging
- Persistent state with `usePersistState` hook

### Component Organization

Components are organized by feature:
- `components/home/`: Home screen, repository selection
- `components/repository/`: Main repository views
  - CommitLog.tsx - Git log visualization
  - BlameViewer.tsx - Git blame view
  - LsTree.tsx - Tree browsing
  - WorkingTree.tsx - Working directory status
  - CommitDetail.tsx - Individual commit details
  - DiffViewer.tsx - File diff display

### Git Operations

Git operations are implemented in Rust modules under `src-tauri/app/src/git/`:
- `log.rs` - Commit history
- `blame.rs` - File blame information
- `commit_detail.rs` - Detailed commit info with file changes
- `status.rs` - Working tree status
- `lstree.rs` - Tree listing
- `refs.rs` - Branch and tag management
- `workingtree.rs` - Staging, committing, resetting
- `branch.rs` - Branch operations
- `switch.rs` - Branch switching
- `reset.rs` - Reset operations

## Build Process

### Build Scripts (in `build/`)
- `generate-bindings.ts` - Generate TypeScript types from Rust
- `generate-invoke.ts` - Generate Tauri command wrappers
- `generate-iconname.ts` - Icon name generation
- `create-iconbundle.ts` - Icon bundle creation
- `generate-gitinfo.ts` - Git info embedding
- `generate-licenses.ts` - License information

### Development
```bash
npm run watch:frontend  # Frontend dev server with TS type checking
npm run watch:tauri     # Tauri dev mode
```

### Build
```bash
npm run build:frontend  # Build frontend (runs prebuild, generate-dts, check:ts, build:ts)
npm run build:backend   # Build backend (generates licenses, runs tauri build)
npm run build          # Full build
```

### Formatting & Linting
```bash
npm run format:frontend  # Biome format for React code
npm run format:tauri     # cargo fmt for Rust code
npm run lint            # Biome lint
npm run check:ts        # TypeScript type checking
npm run check:tauri     # Cargo check
```

## Important Conventions

### Path Aliases
- `@/` → `src/react/`
- `@backend/` → `src-tauri/types/bindings/` (generated types)

### Naming Conventions
- React components: PascalCase (e.g., `CommitList.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTreeModel.ts`)
- Rust modules: snake_case (e.g., `commit_detail.rs`)
- Rust structs: PascalCase (e.g., `CommitDetail`)

### Icons

The project uses **Iconify** for icons with a typesafe wrapper at `components/Icon.tsx`. Only the following icon sets are allowed:
- **mdi** - Material Design Icons (e.g., `mdi:git-branch`)
- **octicon** - GitHub Octicons (e.g., `octicon:git-commit-16`)

Usage:
```tsx
import { Icon } from '@/components/Icon';

<Icon icon="mdi:git-branch" />
<Icon icon="octicon:git-commit-16" />
```

**Important**: Always use `@/components/Icon` instead of directly importing from `@iconify/react` to ensure type safety.

### Type Generation Workflow
1. Define types in `src-tauri/types/src/lib.rs` with `#[derive(TS)]`
2. Run `npm run generate-dts:bindings` to generate TypeScript types
3. Import in frontend: `import type { Commit } from "@backend/Commit"`

### Error Handling
- Rust uses `Result<T, E>` with `thiserror` for error types
- Frontend uses React Error Boundaries
- TanStack Query handles async errors with built-in error states

### Configuration
User configuration is stored in Tauri's app directory:
- `Config` struct in `types/src/lib.rs` defines available settings
- Font family (standard/monospace)
- Font size (small/medium/x-small)
- External diff tool path
- Interactive shell path
- Gravatar usage
- Log level

## Development Notes

### Memory Requirements
Minimum 3GB RAM required during build (mentioned in README).

### Testing
```bash
npm run test:tauri  # Run Rust tests
```

### Current State
The project has substantial functionality implemented including:
- Commit log visualization with graph
- Blame view with commit metadata
- File tree browsing
- Working tree status and staging
- Commit creation
- Branch operations
- Interactive shell integration
- External diff tool integration
- Commit comparison view

### Key Features
- **Home View**: Repository selection and recent repositories
- **Log View**: Commit history with graphical representation
- **Blame View**: Line-by-line commit attribution with metadata
- **Tree View**: Browse repository tree at any commit with optional blame
- **Working Tree**: Stage/unstage changes, commit
- **Commit Diff**: Compare any two commits
- **Shell Integration**: Interactive terminal with repository context

## Git Information

Repository: https://github.com/wonderful-panda/inazuma
License: MIT
