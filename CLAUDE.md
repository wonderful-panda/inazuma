# Inazuma - CLAUDE.md

Inazuma is a Git repository browser built with Tauri 2 (Rust backend) + React 19 (TypeScript frontend).

For detailed documentation, see:
- [`doc/internal/PROJECT_OVERVIEW.md`](doc/internal/PROJECT_OVERVIEW.md) — architecture, tech stack, project structure, conventions
- [`doc/internal/GENERATE_BINDINGS.md`](doc/internal/GENERATE_BINDINGS.md) — how to generate TypeScript bindings from Rust
- [`doc/internal/REACT_QUERY_USAGE.md`](doc/internal/REACT_QUERY_USAGE.md) — React Query hooks for Tauri commands
- [`doc/internal/TAURI_COMMANDS.md`](doc/internal/TAURI_COMMANDS.md) — full reference for all Tauri IPC commands

---

## Common Commands

```bash
# Development
npm run watch:frontend   # Frontend dev server with TS type checking
npm run watch:tauri      # Tauri dev mode

# Build
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend
npm run build            # Full build

# Type generation (run after modifying Rust types or commands)
npm run generate-dts             # Generate all bindings
npm run generate-dts:bindings    # Rust types → TypeScript (ts-rs)
npm run generate-dts:invoke      # Tauri commands → typed invoke wrapper

# Lint / Format / Check
npm run format:frontend  # Biome format (React/TS)
npm run format:tauri     # cargo fmt (Rust)
npm run lint             # Biome lint
npm run check:ts         # TypeScript type checking
npm run check:tauri      # cargo check

# Test
npm run test:tauri       # Rust tests
```

---

## Key Conventions

### Path Aliases
- `@/` → `src/react/`
- `@backend/` → `src-tauri/types/bindings/` (auto-generated from Rust)

### Type Safety Across the IPC Boundary
Rust types in `src-tauri/types/src/lib.rs` are annotated with `#[derive(TS)]` + `#[ts(export)]` and exported via `npm run generate-dts:bindings`. Tauri command signatures in `src-tauri/app/src/commands.rs` are parsed into a typed `invoke` wrapper via `npm run generate-dts:invoke`. Always regenerate after any changes.

### Icons
Use `@/components/Icon` (not `@iconify/react` directly). Only **mdi** and **octicon** icon sets are allowed.

```tsx
import { Icon } from '@/components/Icon';
<Icon icon="mdi:git-branch" />
```

### Tauri Command Invocation
- **Deterministic queries** (e.g., `get_commit_detail`, `get_blame`, `get_changes`): use `useTauriQuery` / `useTauriSuspenseQuery` / `useTauriComposeQuery` from `@/hooks/useTauriQuery`
- **Mutations** (e.g., `commit`, `stage`, `reset`): use `invokeTauriCommand` directly
- **Imperative fetching** in event handlers: use `useTauriQueryInvoke()`

### Maintaining TAURI_COMMANDS.md
When any Tauri command is added, modified, or deleted, update `doc/internal/TAURI_COMMANDS.md` accordingly.

### Language
Write all source code comments and Git commit messages in **English**.
