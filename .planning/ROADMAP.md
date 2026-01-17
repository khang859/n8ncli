# Roadmap: n8ncli

## Overview

Complete the workflow CRUD operations for the n8ncli tool. Starting with file-based create and update commands, then adding ID-based delete, activate, and deactivate commands. All commands follow existing patterns established in the codebase.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Create & Update Commands** - File-based workflow operations with JSON input
- [x] **Phase 2: State Operations** - Delete, activate, and deactivate commands

## Phase Details

### Phase 1: Create & Update Commands
**Goal**: Add `workflows create` and `workflows update` commands that read workflow JSON from files
**Depends on**: Nothing (first phase)
**Research**: Unlikely (follows existing command patterns, standard Node.js file reading)
**Plans**: 1 (complete)

Key deliverables:
- `workflows create --file <path>` command
- `workflows update <id> --file <path>` command
- JSON file validation
- Proper error handling for file operations

### Phase 2: State Operations
**Goal**: Add `workflows delete`, `workflows activate`, and `workflows deactivate` commands
**Depends on**: Phase 1
**Research**: Unlikely (ID-based operations, standard CLI confirmation patterns)
**Plans**: 2

Key deliverables:
- `workflows delete <id>` command with confirmation prompt
- `workflows activate <id>` command
- `workflows deactivate <id>` command

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Create & Update Commands | 1/1 | Complete | 2026-01-17 |
| 2. State Operations | 2/2 | Complete | 2026-01-17 |
