# Testing Patterns

**Analysis Date:** 2026-01-17

## Test Framework

**Runner:**
- Vitest 4.0.17
- Config: `vitest.config.ts` in project root

**Assertion Library:**
- Vitest built-in `expect`
- Matchers: `toBe`, `toEqual`, `toThrow`, `toMatchObject`

**Run Commands:**
```bash
npm run test              # Run all tests once
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Test File Organization

**Location:**
- Co-located with source: `*.test.ts` alongside source files
- Example: `src/config.ts` → `src/config.test.ts`

**Naming:**
- `{module-name}.test.ts` for all tests
- No distinction between unit/integration in filename

**Structure:**
```
src/
├── config.ts
├── config.test.ts           # 215 lines
└── utils/
    ├── configStore.ts
    └── configStore.test.ts  # 301 lines
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // Reset state, setup mocks
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle valid input', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('error message');
    });
  });
});
```

**Patterns:**
- Nested describe blocks for logical grouping (3-4 levels)
- `beforeEach` for per-test setup
- `afterEach` with `vi.restoreAllMocks()`
- Arrange/Act/Assert comments in complex tests

## Mocking

**Framework:**
- Vitest built-in mocking (`vi`)
- Module mocking via `vi.mock()` at top of test file

**Patterns:**
```typescript
import { vi } from 'vitest';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('test suite', () => {
  it('mocks file system', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('{"host": "test"}');

    // Test code using mocked functions

    expect(fs.existsSync).toHaveBeenCalledWith('/expected/path');
  });
});
```

**What to Mock:**
- File system operations (`node:fs`)
- Environment variables (`process.env`)
- OS utilities (`node:os`)

**What NOT to Mock:**
- Internal pure functions
- Simple utilities (string manipulation)
- TypeScript types

## Fixtures and Factories

**Test Data:**
```typescript
// Inline mock data for simple cases
const mockConfig = {
  host: 'https://n8n.example.com/api/v1',
  apiKey: 'test-api-key',
};

// vi.mocked for complex scenarios
vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));
```

**Environment Mocking:**
```typescript
beforeEach(() => {
  vi.stubEnv('N8N_HOST', 'https://env.example.com/api/v1');
  vi.stubEnv('N8N_API_KEY', 'env-api-key');
});

afterEach(() => {
  vi.unstubAllEnvs();
});
```

## Coverage

**Requirements:**
- No enforced coverage target
- Coverage tracked for awareness
- Focus on critical paths

**Configuration:**
```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  include: ['src/**/*.ts'],
  exclude: ['src/**/*.test.ts', 'src/bin.ts'],
}
```

**View Coverage:**
```bash
npm run test:coverage
# Open coverage/index.html for detailed report
```

## Test Types

**Unit Tests:**
- Test single function in isolation
- Mock all external dependencies
- Examples: `config.test.ts`, `configStore.test.ts`

**Test Categories in `config.test.ts`:**
- Priority handling (CLI > env > file) - 5 tests
- Missing values handling - 3 tests
- Empty/partial config - 2 tests
- Validation and throwing - 4 tests

**Test Categories in `configStore.test.ts`:**
- File path resolution - 2 tests
- Config loading with validation - 5 tests
- JSON parsing and error handling - 3 tests
- File permissions checking - 3 tests
- Config saving - 2 tests
- Utility functions (masking, validation) - 7 tests

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
```

**Error Testing:**
```typescript
it('should throw on invalid input', () => {
  expect(() => parse(null)).toThrow('Cannot parse null');
});

// Async error
it('should reject on failure', async () => {
  await expect(asyncCall()).rejects.toThrow('error message');
});
```

**Environment Variable Testing:**
```typescript
describe('environment variable handling', () => {
  beforeEach(() => {
    vi.stubEnv('N8N_HOST', 'https://test.com/api/v1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads from environment', () => {
    const config = loadConfig();
    expect(config.host).toBe('https://test.com/api/v1');
  });
});
```

## Test Coverage Gaps

**Areas without tests:**
- `src/client/index.ts` - HTTP client, API requests
- `src/commands/*.ts` - Command handlers
- `src/utils/output.ts` - Output formatting
- `src/utils/errors.ts` - Error analysis
- `src/index.ts` - Program setup, signal handlers

**Recommendation:** Add tests for HTTP client logic and command execution.

---

*Testing analysis: 2026-01-17*
*Update when test patterns change*
