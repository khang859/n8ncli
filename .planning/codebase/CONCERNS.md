# Codebase Concerns

**Analysis Date:** 2026-01-17

## Tech Debt

**Missing error handling in command actions:**
- Issue: Command handlers lack try/catch, relying on top-level error handling
- Files: `src/commands/workflows.ts` (lines 20-38, 45-56), `src/commands/test.ts` (lines 17-41)
- Why: Quick implementation, errors caught at program level
- Impact: Harder to add command-specific error handling or recovery
- Fix approach: Wrap async action handlers in try/catch blocks

**Direct process.exit() in commands:**
- Issue: Commands call `process.exit()` directly instead of returning/throwing
- Files: `src/commands/test.ts` (lines 27, 35, 39), `src/commands/config.ts` (lines 76, 85, 92)
- Why: Simple exit code control
- Impact: Makes unit testing command handlers difficult
- Fix approach: Return exit codes or throw, let top-level handle exit

## Known Bugs

**Unvalidated limit parameter:**
- Symptoms: Negative numbers or NaN accepted for `--limit` option
- Files: `src/commands/workflows.ts` (line 15)
- Trigger: `n8ncli workflows list --limit -5` or `--limit abc`
- Workaround: Provide valid positive numbers
- Root cause: `parseInt` used without validation
- Fix: Add validation for positive integers

## Security Considerations

**API key visible in process listing:**
- Risk: `--api-key <key>` flag value visible in `ps aux` output
- Files: `src/index.ts` (line 43)
- Current mitigation: Persisted config and env vars available as alternatives
- Recommendations: Document limitation in README, recommend env vars over CLI flag

**Permissive file permission warnings:**
- Risk: Config file with insecure permissions still loaded with warning only
- Files: `src/utils/configStore.ts` (lines 50-54)
- Current mitigation: Warning printed to stderr
- Recommendations: Consider refusing to load or prompting user to fix

## Performance Bottlenecks

**No caching:**
- Problem: Every command makes fresh API calls
- Impact: Repeated `workflows list` calls hit API each time
- Cause: Stateless design, no local caching
- Improvement path: Add optional caching with TTL for list operations

## Fragile Areas

**String-based error detection:**
- Files: `src/utils/errors.ts` (line 61)
- Why fragile: Checks `error.message.includes('is required')` to detect config errors
- Common failures: Any error containing "is required" treated as config error
- Safe modification: Use error codes or custom error classes instead
- Test coverage: Not directly tested

**ANSI color code handling in table output:**
- Files: `src/utils/output.ts` (lines 45-46)
- Why fragile: Fixed `statusPadding = 19` assumes specific ANSI escape lengths
- Common failures: Incorrect alignment if colors change
- Safe modification: Use proper table library or strip ANSI before measuring
- Test coverage: No tests for output formatting

## Test Coverage Gaps

**HTTP client untested:**
- What's not tested: `N8nApiClient.request()`, error handling, response parsing
- Files: `src/client/index.ts`
- Risk: API communication bugs undetected
- Priority: High
- Difficulty to test: Need to mock fetch or use HTTP mocking library

**Command handlers untested:**
- What's not tested: Full command execution, option parsing, output generation
- Files: `src/commands/workflows.ts`, `src/commands/test.ts`, `src/commands/config.ts`
- Risk: Command behavior regressions undetected
- Priority: Medium
- Difficulty to test: Need to mock client or use integration tests

**Output formatting untested:**
- What's not tested: `formatOutput()`, table generation, color handling
- Files: `src/utils/output.ts`
- Risk: Output format bugs, alignment issues
- Priority: Low
- Difficulty to test: Need snapshot testing or string comparison

**Signal handlers untested:**
- What's not tested: SIGINT/SIGTERM handling, cleanup function execution
- Files: `src/index.ts` (lines 21-36)
- Risk: Graceful shutdown issues
- Priority: Low
- Difficulty to test: Need to simulate signals in test environment

## Missing Critical Features

**No pagination in list command:**
- Problem: `workflows list` fetches first page only (API returns paginated data)
- Files: `src/commands/workflows.ts`
- Current workaround: Use `--cursor` flag manually
- Blocks: Can't see all workflows if >default limit
- Implementation complexity: Low (add `--all` flag with cursor iteration)

**No workflow creation/update/delete:**
- Problem: CLI only reads workflows, can't create or modify
- Current workaround: Use n8n web UI
- Blocks: Can't automate workflow management
- Implementation complexity: Medium (add POST/PUT/DELETE API methods and commands)

## Positive Findings

- ✓ Exit codes follow convention (0, 1, 2)
- ✓ NO_COLOR environment variable respected throughout
- ✓ Config file permissions properly set to 0600
- ✓ API keys masked in display output
- ✓ Custom error classes with proper hierarchy
- ✓ TypeScript strict mode enabled
- ✓ .env.example provided
- ✓ Good separation of concerns
- ✓ Comprehensive tests for configuration loading

---

*Concerns audit: 2026-01-17*
*Update as issues are fixed or new ones discovered*
