# TypeScript Bindings Generation Guide

This document describes how to generate TypeScript bindings for Tauri commands and types in the Inazuma project.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Generating Bindings](#generating-bindings)
- [Adding New Types](#adding-new-types)
- [Adding New Commands](#adding-new-commands)
- [Troubleshooting](#troubleshooting)
- [Implementation Details](#implementation-details)

---

## Overview

Inazuma uses a two-part system for generating TypeScript bindings from Rust code:

1. **Type Bindings** - Generated from Rust structs/enums using `ts-rs`
2. **Command Bindings** - Generated from Tauri command functions using a custom parser

This ensures type safety between the Rust backend and TypeScript frontend, preventing runtime errors caused by type mismatches.

**Benefits:**
- Type-safe IPC communication between frontend and backend
- Automatic TypeScript types from Rust definitions
- Compile-time error checking
- IntelliSense support in IDEs
- Single source of truth (Rust types)

---

## Architecture

### Type Bindings (ts-rs)

```
┌─────────────────────┐
│  Rust Structs/Enums │  (in src-tauri/types/src/lib.rs)
│  with #[derive(TS)] │
└──────────┬──────────┘
           │
           │ cargo test (triggers ts-rs)
           │
           ▼
┌─────────────────────┐
│  TypeScript Files   │  (in src-tauri/types/bindings/*.ts)
│  Config.ts          │
│  Commit.ts          │
│  FileEntry.ts, etc. │
└─────────────────────┘
```

### Command Bindings (Custom Generator)

```
┌─────────────────────┐
│  Tauri Commands     │  (in src-tauri/app/src/commands.rs)
│  with #[tauri::     │
│  command] attribute │
└──────────┬──────────┘
           │
           │ cargo run (custom parser)
           │
           ▼
┌─────────────────────┐
│  JSON Function Defs │  (TsFunc[])
└──────────┬──────────┘
           │
           │ TypeScript script processes JSON
           │
           ▼
┌─────────────────────┐
│  tauri-invoke.d.ts  │  (in src/react/generated/)
│  Type-safe invoke   │
│  function           │
└─────────────────────┘
```

---

## Prerequisites

- Rust toolchain (cargo)
- Node.js and npm/pnpm/yarn
- Project dependencies installed

---

## Generating Bindings

### Quick Start

To generate all bindings at once:

```bash
npm run generate-dts
```

This runs both `generate-dts:bindings` and `generate-dts:invoke` in sequence.

### Individual Generation

#### 1. Generate Type Bindings

```bash
npm run generate-dts:bindings
```

This command:
1. Runs `cargo test` in `src-tauri/types`
2. ts-rs generates TypeScript files in `src-tauri/types/bindings/`
3. Each Rust type with `#[derive(TS)]` and `#[ts(export)]` gets a corresponding `.ts` file

**Output Location:** `src-tauri/types/bindings/*.ts`

**Example Output:**
```typescript
// Config.ts
export type Config = {
  fontFamily: FontFamily;
  fontSize: FontSize;
  externalDiffTool?: string;
  interactiveShell?: string;
  recentListCount: number;
  avatarShape: AvatarShape;
  useGravatar: boolean;
};
```

#### 2. Generate Command Bindings

```bash
npm run generate-dts:invoke
```

This command:
1. Runs the custom generator: `cargo run --manifest-path src-tauri/generate/Cargo.toml`
2. Parses `src-tauri/app/src/commands.rs` for functions with `#[tauri::command]`
3. Extracts function signatures (name, parameters, return type)
4. Generates TypeScript type definitions in `src/react/generated/tauri-invoke.d.ts`

**Output Location:** `src/react/generated/tauri-invoke.d.ts`

**Example Output:**
```typescript
import { Config } from "@backend/Config";
import { Environment } from "@backend/Environment";

export type TauriInvokeType = {
  "load_persist_data": {
    args: [],
    ret: [Config, Environment]
  };
  "save_config": {
    args: [{ newConfig: Config }],
    ret: void
  };
  // ... more commands
};

export type TauriInvoke = <K extends keyof TauriInvokeType>(
  command: K,
  ...payload: TauriInvokeType[K]["args"]
) => Promise<TauriInvokeType[K]["ret"]>;
```

### Integration with Build Process

Bindings are automatically generated during the build process:

```bash
npm run build:frontend
```

This runs:
1. `prebuild:iconname`
2. `prebuild:iconbundle`
3. `prebuild:gitinfo`
4. **`generate-dts`** ← Generates bindings here
5. `check:ts`
6. `build:ts`

---

## Adding New Types

### Step 1: Define the Rust Type

Add your type to `src-tauri/types/src/lib.rs`:

```rust
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]  // Snake_case → camelCase
#[ts(export)]                        // Enable export to TypeScript
pub struct MyNewType {
    pub id: String,
    pub count: u32,
    #[ts(optional)]                  // Maps to optional in TS
    pub description: Option<String>,
}
```

### Step 2: Generate Bindings

```bash
npm run generate-dts:bindings
```

### Step 3: Use in Frontend

The generated file will be at `src-tauri/types/bindings/MyNewType.ts`:

```typescript
// Automatically generated
export type MyNewType = {
  id: string;
  count: number;
  description?: string;
};
```

Import it in your TypeScript code:

```typescript
import type { MyNewType } from '@backend/MyNewType';

const data: MyNewType = {
  id: 'abc123',
  count: 42,
  description: 'Optional field'
};
```

### ts-rs Attributes Reference

Common attributes for customizing TypeScript output:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `#[ts(export)]` | Export this type to TypeScript | `#[ts(export)]` |
| `#[ts(optional)]` | Make field optional in TS | `#[ts(optional)]` |
| `#[ts(rename = "newName")]` | Rename field | `#[ts(rename = "userId")]` |
| `#[ts(type = "string")]` | Override type | `#[ts(type = "string")]` |
| `#[ts(skip)]` | Skip this field | `#[ts(skip)]` |
| `#[ts(inline)]` | Inline the type definition | `#[ts(inline)]` |

### Rust to TypeScript Type Mapping

| Rust Type | TypeScript Type |
|-----------|-----------------|
| `String`, `&str` | `string` |
| `i32`, `u32`, `f64`, etc. | `number` |
| `bool` | `boolean` |
| `Option<T>` | `T \| undefined` |
| `Vec<T>` | `Array<T>` |
| `HashMap<K, V>` | `Record<K, V>` |
| `(A, B, C)` | `[A, B, C]` |
| `()` | `void` |
| Custom struct/enum | Exported TypeScript type |

---

## Adding New Commands

### Step 1: Define the Tauri Command

Add your command to `src-tauri/app/src/commands.rs`:

```rust
/// Description of what this command does.
///
/// # Arguments
/// * `param1` - Description of parameter
///
/// # Returns
/// Description of return value
#[tauri::command]
pub async fn my_new_command(
    param1: String,
    param2: u32,
) -> Result<MyReturnType, String> {
    // Implementation
    Ok(MyReturnType { /* ... */ })
}
```

### Step 2: Register the Command

Add it to the Tauri builder in `src-tauri/app/src/main.rs`:

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // ... existing commands
        my_new_command,  // Add here
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

### Step 3: Generate Command Bindings

```bash
npm run generate-dts:invoke
```

### Step 4: Use in Frontend

The command is now available with full type safety:

```typescript
import { invoke } from '@/lib/tauri';

// TypeScript knows the exact signature!
const result = await invoke('my_new_command', {
  param1: 'hello',
  param2: 42
});
// result is typed as MyReturnType
```

### Parameter Handling

#### Simple Parameters

```rust
#[tauri::command]
pub async fn simple_command(name: String, age: u32) -> Result<(), String>
```

Frontend call:
```typescript
await invoke('simple_command', { name: 'Alice', age: 30 });
```

#### Optional Parameters

```rust
#[tauri::command]
pub async fn optional_param(required: String, optional: Option<u32>) -> Result<(), String>
```

Frontend call:
```typescript
await invoke('optional_param', { required: 'value' });
// or
await invoke('optional_param', { required: 'value', optional: 42 });
```

#### Complex Types

```rust
#[tauri::command]
pub async fn complex_command(config: Config) -> Result<(), String>
```

Frontend call:
```typescript
await invoke('complex_command', {
  config: {
    fontFamily: { standard: 'Arial', monospace: 'Courier' },
    fontSize: { standard: 12, monospace: 11 },
    // ... other fields
  }
});
```

#### No Parameters

```rust
#[tauri::command]
pub async fn no_params() -> Result<String, String>
```

Frontend call:
```typescript
const result = await invoke('no_params');
```

---

## Troubleshooting

### Types Not Generating

**Problem:** Running `generate-dts:bindings` but TypeScript files aren't created.

**Solution:**
1. Ensure the Rust type has both `#[derive(TS)]` and `#[ts(export)]`
2. Check for compilation errors: `cargo check --manifest-path src-tauri/types/Cargo.toml`
3. Manually run: `cargo test --manifest-path src-tauri/types/Cargo.toml`
4. Check the test output for ts-rs errors

### Commands Not Recognized

**Problem:** New command exists but TypeScript doesn't recognize it.

**Solution:**
1. Verify the function has the `#[tauri::command]` attribute
2. Ensure it's registered in `tauri::generate_handler![...]`
3. Regenerate: `npm run generate-dts:invoke`
4. Restart TypeScript language server in your IDE

### Type Mismatch Errors

**Problem:** TypeScript complains about type mismatches at runtime.

**Solution:**
1. Regenerate all bindings: `npm run generate-dts`
2. Verify Rust types match what the command expects
3. Check for `#[serde(rename_all = "camelCase")]` on Rust structs
4. Clear TypeScript cache and restart IDE

### Build Script Errors

**Problem:** `generate-dts` fails during build.

**Solution:**
1. Check Rust compilation: `cargo check --manifest-path src-tauri/app/Cargo.toml`
2. Check custom generator: `cargo check --manifest-path src-tauri/generate/Cargo.toml`
3. Verify Node.js and ts-node are installed
4. Check file permissions on output directories

### Custom Generator Fails

**Problem:** `generate-dts:invoke` crashes or produces incorrect output.

**Solution:**
1. Manually run the generator to see errors:
   ```bash
   cd src-tauri/generate
   cargo run -- --src ../app/src/commands.rs
   ```
2. Check for unsupported type patterns
3. Verify command signatures are valid Rust
4. Check the `invoke_type.rs` parser for supported patterns

---

## Implementation Details

### Directory Structure

```
inazuma/
├── src-tauri/
│   ├── types/              # Rust types with ts-rs
│   │   ├── src/
│   │   │   └── lib.rs      # Type definitions
│   │   ├── bindings/       # Generated TS files (output)
│   │   └── Cargo.toml      # ts-rs dependency
│   │
│   ├── generate/           # Custom command parser
│   │   ├── src/
│   │   │   ├── main.rs     # CLI entry point
│   │   │   └── invoke_type.rs  # AST parser
│   │   ├── bindings/       # Parser's own TS types
│   │   └── Cargo.toml
│   │
│   └── app/
│       └── src/
│           └── commands.rs # Tauri commands (parsed)
│
├── src/react/
│   └── generated/          # Generated command types (output)
│       └── tauri-invoke.d.ts
│
└── build/
    ├── generate-bindings.ts  # Wrapper for ts-rs
    └── generate-invoke.ts    # Wrapper for custom parser
```

### ts-rs Integration

The `generate-bindings.ts` script runs `cargo test` in the `types` directory. ts-rs has a test that exports types:

```rust
// Automatically included by ts-rs
#[cfg(test)]
mod export_types {
    use super::*;

    #[test]
    fn export_bindings() {
        Config::export().unwrap();
        Environment::export().unwrap();
        // ... all types with #[ts(export)]
    }
}
```

When tests run, ts-rs exports each type to `bindings/{TypeName}.ts`.

### Custom Command Parser

The `generate` crate:

1. **Parses Rust AST** using the `syn` crate
2. **Finds** functions with `#[tauri::command]` attribute
3. **Extracts** function name, parameters, and return type
4. **Converts** Rust types to TypeScript equivalents
5. **Outputs** JSON with function metadata

The TypeScript script (`generate-invoke.ts`):

1. **Runs** the Rust parser
2. **Receives** JSON with function definitions
3. **Generates** a TypeScript declaration file using Handlebars template
4. **Includes** imports for user-defined types
5. **Creates** a type-safe `invoke` function signature

### Type Conversion Logic

The parser in `src-tauri/generate/src/invoke_type.rs` implements these conversions:

```rust
fn build_ts_type(ty: &syn::Type) -> TsType {
    match ty {
        Type::Path(path) => {
            match path.segments.last().unwrap().ident.to_string().as_str() {
                "String" | "str" => TsType::String,
                "i32" | "u32" | "i64" | "u64" | "f32" | "f64" | "usize" => TsType::Number,
                "bool" => TsType::Boolean,
                "Option" => TsType::Optional(Box::new(/* inner type */)),
                "Vec" => TsType::Array(Box::new(/* element type */)),
                "HashMap" => TsType::Record { /* key & value */ },
                custom_type => TsType::UserDefined(custom_type.to_string()),
            }
        }
        Type::Tuple(tuple) => TsType::Tuple(/* tuple elements */),
        // ... other patterns
    }
}
```

### Generated Type Safety

The generated `TauriInvokeType` provides compile-time safety:

```typescript
export type TauriInvokeType = {
  "command_name": {
    args: [{ param1: string, param2: number }],
    ret: ReturnType
  }
};

export type TauriInvoke = <K extends keyof TauriInvokeType>(
  command: K,
  ...payload: TauriInvokeType[K]["args"]
) => Promise<TauriInvokeType[K]["ret"]>;
```

This ensures:
- **Command names** must be valid (autocomplete works)
- **Arguments** must match the expected shape
- **Return types** are correctly inferred
- **Compile errors** if signatures don't match

---

## Best Practices

### 1. Always Use camelCase Convention

Rust uses `snake_case`, TypeScript uses `camelCase`. Use serde rename:

```rust
#[derive(Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]  // ← Important!
#[ts(export)]
pub struct MyType {
    pub field_name: String,  // → fieldName in TS
}
```

### 2. Document Your Types and Commands

Add doc comments that will help frontend developers:

```rust
/// Represents a Git commit with metadata.
///
/// This type is used throughout the application to display
/// commit information in the UI.
#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Commit {
    /// The commit SHA hash
    pub id: String,
    /// The commit message
    pub message: String,
}
```

### 3. Use Result<T, String> for Commands

Always return `Result` for error handling:

```rust
#[tauri::command]
pub async fn my_command() -> Result<MyType, String> {
    // ...
}
```

Frontend receives typed errors:
```typescript
try {
  const result = await invoke('my_command');
} catch (error) {
  console.error('Command failed:', error);  // error is string
}
```

### 4. Regenerate After Changes

Regenerate bindings after:
- Adding/modifying Rust types
- Adding/modifying Tauri commands
- Changing function signatures
- Adding dependencies

```bash
npm run generate-dts
```

### 5. Use Type Aliases for Complex Types

If you have deeply nested types, create type aliases:

```typescript
import type { TauriInvokeType } from '@/generated/tauri-invoke';

type FetchHistoryReturn = TauriInvokeType['fetch_history']['ret'];
type CommitDetailArgs = TauriInvokeType['get_commit_detail']['args'][0];
```

---

## Reference

### Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run generate-dts` | Generate all bindings |
| `npm run generate-dts:bindings` | Generate type bindings only |
| `npm run generate-dts:invoke` | Generate command bindings only |
| `cargo test -p types` | Manually run ts-rs export |
| `cargo run -p generate -- --src ../app/src/commands.rs` | Manually run command parser |

### Related Files

| File | Purpose |
|------|---------|
| `src-tauri/types/src/lib.rs` | Rust type definitions |
| `src-tauri/app/src/commands.rs` | Tauri command implementations |
| `build/generate-bindings.ts` | Type binding generator script |
| `build/generate-invoke.ts` | Command binding generator script |
| `src-tauri/generate/src/invoke_type.rs` | Command parser implementation |

### External Documentation

- [ts-rs Documentation](https://github.com/Aleph-Alpha/ts-rs)
- [Tauri Command Documentation](https://tauri.app/v1/guides/features/command)
- [Serde Documentation](https://serde.rs/)

---

## Summary

The Inazuma project uses a sophisticated two-part binding generation system:

1. **ts-rs** generates TypeScript types from Rust structs/enums
2. **Custom parser** generates typed `invoke` function from Tauri commands

This provides:
- ✅ Complete type safety across the IPC boundary
- ✅ Automatic synchronization between Rust and TypeScript
- ✅ IntelliSense and autocomplete support
- ✅ Compile-time error detection
- ✅ Single source of truth (Rust code)

To generate bindings, simply run:
```bash
npm run generate-dts
```

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or check the implementation in `build/generate-*.ts` and `src-tauri/generate/`.
