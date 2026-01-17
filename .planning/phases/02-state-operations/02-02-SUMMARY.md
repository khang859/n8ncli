---
phase: 02-state-operations
plan: 02
subsystem: api
tags: [n8n, workflows, commander, cli, activate, deactivate]

# Dependency graph
requires:
  - 02-01 (client methods for activate/deactivate already in place)
provides:
  - workflows activate command
  - workflows deactivate command
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Simple state toggle commands following get command pattern

key-files:
  created: []
  modified:
    - src/commands/workflows.ts

key-decisions:
  - "Followed workflows get command pattern exactly"
  - "Used 'detail' format for default output, 'json' format with --json flag"

patterns-established:
  - "State toggle commands: activate/deactivate follow same structure"

issues-created: []

# Metrics
duration: 2min
completed: 2026-01-17
---

# Phase 2 Plan 02: Activate/Deactivate Commands Summary

**Added `workflows activate` and `workflows deactivate` commands for workflow state management**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-17
- **Completed:** 2026-01-17
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Created `workflows activate <id>` command with:
  - Required `<id>` argument for workflow ID
  - `--json` flag for JSON output
  - Debug logging before and after operation
  - Detail format output by default

- Created `workflows deactivate <id>` command with:
  - Required `<id>` argument for workflow ID
  - `--json` flag for JSON output
  - Debug logging before and after operation
  - Detail format output by default

## Task Commits

Each task was committed atomically:

1. **Task 1: Add workflows activate command** - `396b3e8` (feat)
2. **Task 2: Add workflows deactivate command** - `b2682bb` (feat)

## Files Created/Modified

- `src/commands/workflows.ts` - Added activate and deactivate subcommands

## Verification Completed

- [x] `npm run build` succeeds without errors
- [x] `npm run cli -- workflows activate --help` shows command
- [x] `npm run cli -- workflows deactivate --help` shows command
- [x] `npm run cli -- workflows --help` shows all 7 commands (list, get, create, update, delete, activate, deactivate)

## Decisions Made

- Followed the `workflows get` command pattern exactly for consistency
- Both commands output the full workflow object after state change

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Phase 2 Complete

With this plan complete, Phase 2 (State Operations) is fully implemented:
- Plan 01: Delete command with confirmation + client methods for all state operations
- Plan 02: Activate and deactivate commands

All workflow CRUD operations are now available:
- `workflows list` - List all workflows
- `workflows get` - Get workflow details
- `workflows create` - Create workflow from JSON file
- `workflows update` - Update workflow from JSON file
- `workflows delete` - Delete workflow with confirmation
- `workflows activate` - Activate workflow
- `workflows deactivate` - Deactivate workflow

---
*Phase: 02-state-operations*
*Completed: 2026-01-17*
