# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript CLI tool (`n8ncli`) for interacting with the n8n API to manage n8n workflows. It uses Commander.js for argument parsing and provides commands for listing, viewing, and testing connectivity to n8n instances.

## Required Tools

When working on this project, you MUST use:
- **Auggie MCP** (`mcp__auggie-mcp__codebase-retrieval`) - For semantic codebase search and understanding
- **Context7 MCP** (`mcp__context7__resolve-library-id` and `mcp__context7__query-docs`) - For retrieving up-to-date documentation and code examples

## Development Commands

```bash
# Build the project (compiles TypeScript to dist/)
npm run build

# Build and run the CLI with .env file loaded
npm run cli

# Build and run in one step
npm run cli:dev

# Watch mode for development
npm run dev
```

## Configuration

The CLI requires two environment variables (configured via `.env` file or CLI flags):
- `N8N_HOST` - n8n instance URL including `/api/v1` suffix
- `N8N_API_KEY` - API key from n8n Settings > API

CLI flags `--host` and `--api-key` override environment variables.

## Architecture

```
src/
├── index.ts              # Commander program setup, signal handlers, command registration
├── bin.ts                # Entry point (shebang, calls run())
├── config.ts             # Environment variable loading for N8N_HOST/N8N_API_KEY
├── client/
│   ├── index.ts          # N8nApiClient class - HTTP requests to n8n API
│   └── types.ts          # TypeScript interfaces for API types (N8nWorkflow, etc.)
├── commands/
│   ├── workflows.ts      # `workflows list` and `workflows get` commands
│   ├── test.ts           # `test` command for connection testing
│   └── config.ts         # `config` command to show current configuration
├── errors/
│   └── index.ts          # Custom error classes (N8nApiError, N8nAuthenticationError, N8nConnectionError)
└── utils/
    ├── client.ts         # createClient() factory and debug logging
    ├── errors.ts         # Error handling, exit codes, handleError()
    ├── env.ts            # Environment detection (isTTY, isCI, noColor)
    └── output.ts         # Output formatting (table, json, minimal)
```

## Key Patterns

**Command Registration**: Commands are registered via `registerXxxCommands(program)` functions that receive the Commander program instance.

**Client Creation**: Use `createClient(globalOpts)` from `utils/client.ts` - it merges CLI flags with environment config.

**Output Formatting**: Use `formatOutput(data, format, type)` from `utils/output.ts`. Supports 'table', 'json', 'minimal', and 'detail' formats.

**Error Handling**: Errors are caught at the top level in `run()` and passed to `handleError()` which prints a user-friendly message with optional hints.

**NO_COLOR Support**: All colored output respects the `NO_COLOR` environment variable via conditional chalk wrappers.
