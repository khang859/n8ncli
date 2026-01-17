# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript 5.7.0 - All application code in `src/`

**Secondary:**
- JavaScript - Compiled output in `dist/`

## Runtime

**Environment:**
- Node.js >= 18.0.0 - `package.json` (engines field)
- ES2022 target - `tsconfig.json`
- ES modules ("type": "module") - `package.json`

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Commander.js 14.0.2 - CLI argument parsing and command structure - `src/index.ts`

**Testing:**
- Vitest 4.0.17 - Unit tests - `vitest.config.ts`
- v8 coverage provider - Built-in

**Build/Dev:**
- TypeScript 5.7.0 - Compilation to JavaScript
- tsc - Build script in `package.json`

## Key Dependencies

**Critical:**
- `commander` 14.0.2 - CLI command structure, argument parsing, help generation
- `chalk` 5.6.2 - Terminal color output, status indicators

**Development:**
- `@types/node` 22.0.0 - TypeScript type definitions for Node.js APIs
- `typescript` 5.7.0 - TypeScript compiler
- `vitest` 4.0.17 - Test framework

## Configuration

**Environment:**
- `.env` file for local development (gitignored)
- Environment variables: `N8N_HOST`, `N8N_API_KEY`
- CLI flags `--host` and `--api-key` override environment

**Persisted Config:**
- `~/.n8ncli.json` - User config file with 0600 permissions
- Commands: `config set`, `config show`, `config clear`, `config path`

**Build:**
- `tsconfig.json` - TypeScript compiler options
- `vitest.config.ts` - Test runner configuration

## Platform Requirements

**Development:**
- Any platform with Node.js 18+
- No external dependencies (no Docker, no database)

**Production:**
- Installed globally via `npm link`
- Runs on user's Node.js installation
- Connects to external n8n API

---

*Stack analysis: 2026-01-17*
*Update after major dependency changes*
