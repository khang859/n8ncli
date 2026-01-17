# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- camelCase for modules: `configStore.ts`, `client.ts`
- lowercase for entry points: `bin.ts`, `index.ts`
- `.test.ts` suffix for test files, co-located with source

**Functions:**
- camelCase for all functions: `loadConfig()`, `createClient()`, `formatOutput()`
- `register` prefix for command registration: `registerWorkflowCommands()`
- Async functions: No special prefix

**Variables:**
- camelCase for variables: `globalOpts`, `cliOptions`, `apiKey`
- Function references: `cleanupFn`

**Constants:**
- SCREAMING_SNAKE_CASE for config: `CONFIG_FILENAME`
- Object constants: `ExitCode.SUCCESS`, `ExitCode.ERROR`

**Types:**
- PascalCase for interfaces: `N8nConfig`, `N8nWorkflow`, `GlobalOptions`
- PascalCase for type aliases: `OutputFormat`, `ConfigSource`, `ExitCodeType`
- No `I` prefix for interfaces

**Classes:**
- PascalCase: `N8nApiClient`, `N8nApiError`, `N8nAuthenticationError`
- Prefix with domain: `N8n` for n8n-specific classes

## Code Style

**Formatting:**
- 2-space indentation throughout
- Single quotes for strings: `'commander'`
- Semicolons required at end of statements
- Trailing newline in all files

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- ES2022 target, NodeNext module system
- Type-only imports: `import type { Command } from 'commander'`
- Node.js imports with `node:` prefix: `import * as fs from 'node:fs'`

## Import Organization

**Order:**
1. External packages: `commander`, `chalk`
2. Internal modules: `../client/index.js`, `../config.js`
3. Type imports last: `import type { ... }`

**Patterns:**
- ES module imports with `.js` extension: `'./config.js'`
- Re-exports: `export * from './types.js'`
- Named exports preferred over default

## Error Handling

**Patterns:**
- Custom error classes extending Error in `src/errors/index.ts`
- Throw errors from business logic, catch at top level
- `analyzeError()` categorizes errors and determines exit codes
- `handleError()` prints user-friendly message and exits

**Error Types:**
- `N8nApiError` - HTTP errors from n8n API
- `N8nAuthenticationError` - 401 authentication failures
- `N8nConnectionError` - Network/connection failures

**Exit Codes:**
```typescript
export const ExitCode = {
  SUCCESS: 0,
  ERROR: 1,
  MISUSE: 2,
} as const;
```

## Logging

**Framework:**
- `console.log()` for normal output to stdout
- `console.error()` for errors to stderr
- `chalk` for colored output

**Patterns:**
- `debug()` function for verbose output (controlled by `--verbose`)
- `info()` function for informational output (suppressed by `--quiet`)
- NO_COLOR environment variable respected throughout

## Comments

**When to Comment:**
- JSDoc for public API functions with `@param`, `@returns`
- Inline comments for exit code conventions
- Comments for non-obvious logic (signal handling, permission checks)

**JSDoc Style:**
```typescript
/**
 * Load configuration with source tracking
 * Priority: CLI flags > environment variables > persisted config file
 */
export function loadConfigWithSources(cliOptions?: CliConfigOptions): N8nConfigWithSources {
```

**Inline Comments:**
```typescript
// Exit code 130 = 128 + 2 (SIGINT signal number)
// CLI flags have highest priority
```

## Function Design

**Size:**
- Keep functions focused and under 50 lines
- Extract helpers for complex logic

**Parameters:**
- Max 3 parameters, use options object for more
- Optional parameters with `?` suffix: `cliOptions?: CliConfigOptions`

**Return Values:**
- Explicit return types on public functions
- Return early for guard clauses
- `never` return type for functions that always exit

## Module Design

**Exports:**
- Named exports preferred: `export function loadConfig()`
- Re-exports for public API: `export * from './types.js'`
- Type exports: `export type { N8nConfig }`

**Barrel Files:**
- `index.ts` re-exports public API from directory
- Keep internal helpers private

## NO_COLOR Support

**Implementation Pattern:**
```typescript
import chalk from 'chalk';
import { noColor } from './utils/env.js';

const red = noColor ? (s: string) => s : chalk.red;
const gray = noColor ? (s: string) => s : chalk.gray;
```

Used consistently in: `src/index.ts`, `src/utils/errors.ts`, `src/utils/output.ts`, `src/commands/test.ts`, `src/commands/config.ts`

---

*Convention analysis: 2026-01-17*
*Update when patterns change*
