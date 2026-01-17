# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Layered CLI Application with modular command structure

**Key Characteristics:**
- Single executable with subcommands
- Stateless request-response model
- Configuration priority system (CLI > env > file)
- Custom error hierarchy with user-friendly messages

## Layers

**Entry Layer:**
- Purpose: Bootstrap the application and parse CLI arguments
- Contains: Entry point, program setup, signal handlers
- Location: `src/bin.ts`, `src/index.ts`
- Depends on: Command layer, error utilities
- Used by: npm/CLI invocation

**Command Layer:**
- Purpose: Handle specific CLI commands and route to business logic
- Contains: Command definitions, option parsing, output formatting
- Location: `src/commands/*.ts`
- Depends on: Client layer, utilities
- Used by: Entry layer (Commander.js routing)

**Client Layer:**
- Purpose: HTTP communication with n8n API
- Contains: `N8nApiClient` class, request handling, response parsing
- Location: `src/client/index.ts`, `src/client/types.ts`
- Depends on: Error classes, Node.js fetch
- Used by: Command layer

**Configuration Layer:**
- Purpose: Load and manage configuration from multiple sources
- Contains: Config loading, validation, persistence
- Location: `src/config.ts`, `src/utils/configStore.ts`
- Depends on: Node.js fs, os, path
- Used by: Client layer, command layer

**Utilities Layer:**
- Purpose: Shared helpers and cross-cutting concerns
- Contains: Error handling, output formatting, environment detection
- Location: `src/utils/*.ts`, `src/errors/index.ts`
- Depends on: Node.js builtins only
- Used by: All layers

## Data Flow

**CLI Command Execution:**

1. User runs: `n8ncli workflows list`
2. `src/bin.ts` calls `run()` in `src/index.ts`
3. Commander parses args and routes to `src/commands/workflows.ts`
4. Command handler calls `createClient()` from `src/utils/client.ts`
5. `createClient()` calls `loadConfig()` from `src/config.ts`
6. Config loads from CLI flags > env vars > `~/.n8ncli.json`
7. `N8nApiClient` makes HTTP request to n8n API
8. Response formatted via `formatOutput()` in `src/utils/output.ts`
9. Output printed to stdout, process exits with status code

**State Management:**
- Stateless: Each command execution is independent
- Persisted config at `~/.n8ncli.json` (between sessions)
- No in-memory state between commands

## Key Abstractions

**N8nApiClient:**
- Purpose: Encapsulate all HTTP communication with n8n API
- Location: `src/client/index.ts`
- Pattern: Class with private request method, public API methods
- Examples: `listWorkflows()`, `getWorkflow()`, `testConnection()`

**Command Registration:**
- Purpose: Register CLI subcommands with Commander.js
- Pattern: `registerXxxCommand(program: Command)` functions
- Location: `src/commands/workflows.ts`, `src/commands/test.ts`, `src/commands/config.ts`

**Configuration Loading:**
- Purpose: Load config with priority handling and source tracking
- Pattern: `loadConfig()` throws on missing, `loadConfigWithSources()` tracks sources
- Location: `src/config.ts`

**Custom Error Classes:**
- Purpose: Type-safe error handling with specific error types
- Pattern: Inheritance hierarchy from Error
- Location: `src/errors/index.ts`
- Examples: `N8nApiError`, `N8nAuthenticationError`, `N8nConnectionError`

## Entry Points

**Primary (`src/bin.ts`):**
- Location: `src/bin.ts`
- Triggers: `n8ncli` command invocation
- Responsibilities: Shebang, import and call `run()`

**Program Setup (`src/index.ts`):**
- Location: `src/index.ts`
- Triggers: Called by `bin.ts`
- Responsibilities: Create Commander program, register commands, parse args, handle errors

## Error Handling

**Strategy:** Throw errors, catch at top level, exit with appropriate code

**Patterns:**
- Custom error classes for specific failure modes (`src/errors/index.ts`)
- `analyzeError()` determines error type and exit code (`src/utils/errors.ts`)
- `handleError()` prints user-friendly message with hints, exits
- Top-level try/catch in `run()` function

**Exit Codes:**
- 0: Success
- 1: General error (API errors, unknown errors)
- 2: Misuse (missing config, bad arguments)
- 130: SIGINT (Ctrl+C)
- 143: SIGTERM

## Cross-Cutting Concerns

**Logging:**
- `debug()` and `info()` functions in `src/utils/client.ts`
- Controlled by `--verbose` and `--quiet` flags
- No external logging framework

**Validation:**
- URL validation for host in `src/utils/configStore.ts`
- API key non-empty validation
- Config key normalization (host, apikey, api-key → host, apiKey)

**Output Formatting:**
- `formatOutput()` in `src/utils/output.ts`
- Formats: json, table, minimal, detail
- Respects NO_COLOR environment variable

**Signal Handling:**
- SIGINT and SIGTERM handlers in `src/index.ts`
- Cleanup function registration pattern

---

*Architecture analysis: 2026-01-17*
*Update when major patterns change*
