# n8ncli

## What This Is

A TypeScript CLI tool for interacting with the n8n API to manage n8n workflows. Provides commands for listing, viewing, creating, updating, and deleting workflows from the command line, with support for multiple output formats and flexible configuration.

## Core Value

Complete CRUD operations for workflows that work reliably — if everything else fails, the ability to create, read, update, and delete workflows must work.

## Requirements

### Validated

- ✓ List all workflows with filtering (active/inactive, tags, pagination) — existing
- ✓ Get workflow details by ID — existing
- ✓ Test connection to n8n instance — existing
- ✓ Configuration management (env vars, CLI flags, persistent config file) — existing
- ✓ Output formatting (json, table, minimal, detail) — existing
- ✓ Error handling with custom error classes — existing

### Active

- [ ] Create workflow from JSON file
- [ ] Update workflow from JSON file
- [ ] Delete workflow by ID
- [ ] Activate workflow by ID
- [ ] Deactivate workflow by ID

### Out of Scope

- Workflow execution endpoints — focus on workflow management first
- Dedicated tag CRUD commands — tags can be included in workflow create/update
- Interactive workflow editor — CLI focuses on file-based input

## Context

This CLI connects to the n8n public REST API. The existing codebase follows a layered architecture:
- Entry layer (bin.ts, index.ts)
- Command layer (commands/*.ts)
- Client layer (client/index.ts, client/types.ts)
- Configuration layer (config.ts, utils/configStore.ts)
- Utilities layer (utils/*.ts, errors/index.ts)

Commands are registered via `registerXxxCommands(program)` functions. The `N8nApiClient` class handles all HTTP communication. Output uses `formatOutput()` for consistent rendering.

n8n API endpoints for workflows:
- GET /api/v1/workflows — list workflows
- GET /api/v1/workflows/:id — get workflow
- POST /api/v1/workflows — create workflow
- PUT /api/v1/workflows/:id — update workflow
- DELETE /api/v1/workflows/:id — delete workflow
- POST /api/v1/workflows/:id/activate — activate workflow
- POST /api/v1/workflows/:id/deactivate — deactivate workflow

## Constraints

- **Tech stack**: TypeScript, Commander.js, Node.js 18+
- **Input method**: JSON file input for create/update operations (--file flag)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| JSON file input over stdin | User preference for explicit file handling | — Pending |
| Follow existing command patterns | Maintain consistency with list/get commands | — Pending |

---
*Last updated: 2026-01-17 after initialization*
