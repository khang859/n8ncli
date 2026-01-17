import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Command } from 'commander';
import { registerWorkflowCommands } from '../../src/commands/workflows.js';
import type { N8nWorkflow } from '../../src/client/types.js';

// Mock dependencies
vi.mock('../../src/utils/client.js', () => ({
  createClient: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('../../src/utils/output.js', () => ({
  formatOutput: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('node:readline/promises', () => ({
  createInterface: vi.fn(),
}));

// Import mocked modules
import { createClient } from '../../src/utils/client.js';
import { formatOutput } from '../../src/utils/output.js';

// Mock workflow data
const mockWorkflow: N8nWorkflow = {
  id: 'wf-123',
  name: 'Test Workflow',
  active: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  nodes: [],
  tags: [],
};

const mockWorkflows: N8nWorkflow[] = [
  mockWorkflow,
  {
    id: 'wf-456',
    name: 'Another Workflow',
    active: false,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
    nodes: [],
    tags: [],
  },
];

// Helper to create a program and run a command
async function runCommand(args: string[]): Promise<void> {
  const program = new Command();
  program.option('--host <host>');
  program.option('--api-key <key>');
  program.exitOverride(); // Prevents process.exit
  registerWorkflowCommands(program);
  await program.parseAsync(['node', 'test', ...args]);
}

describe('workflows commands', () => {
  let mockClient: {
    listWorkflows: ReturnType<typeof vi.fn>;
    getWorkflow: ReturnType<typeof vi.fn>;
    createWorkflow: ReturnType<typeof vi.fn>;
    updateWorkflow: ReturnType<typeof vi.fn>;
    deleteWorkflow: ReturnType<typeof vi.fn>;
    activateWorkflow: ReturnType<typeof vi.fn>;
    deactivateWorkflow: ReturnType<typeof vi.fn>;
  };
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();

    // Create mock client
    mockClient = {
      listWorkflows: vi.fn(),
      getWorkflow: vi.fn(),
      createWorkflow: vi.fn(),
      updateWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
      activateWorkflow: vi.fn(),
      deactivateWorkflow: vi.fn(),
    };

    vi.mocked(createClient).mockReturnValue(mockClient as unknown as ReturnType<typeof createClient>);
    vi.mocked(formatOutput).mockReturnValue('formatted output');

    // Spy on console.log
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('workflows list', () => {
    beforeEach(() => {
      mockClient.listWorkflows.mockResolvedValue(mockWorkflows);
    });

    it('creates client and calls listWorkflows', async () => {
      await runCommand(['workflows', 'list']);

      expect(createClient).toHaveBeenCalled();
      expect(mockClient.listWorkflows).toHaveBeenCalledWith({
        active: undefined,
        limit: undefined,
        tags: undefined,
        cursor: undefined,
      });
    });

    it('passes --active option to listWorkflows', async () => {
      await runCommand(['workflows', 'list', '--active']);

      expect(mockClient.listWorkflows).toHaveBeenCalledWith({
        active: true,
        limit: undefined,
        tags: undefined,
        cursor: undefined,
      });
    });

    it('passes --inactive option to listWorkflows', async () => {
      await runCommand(['workflows', 'list', '--inactive']);

      expect(mockClient.listWorkflows).toHaveBeenCalledWith({
        active: false,
        limit: undefined,
        tags: undefined,
        cursor: undefined,
      });
    });

    it('passes --limit option to listWorkflows', async () => {
      await runCommand(['workflows', 'list', '--limit', '10']);

      expect(mockClient.listWorkflows).toHaveBeenCalledWith({
        active: undefined,
        limit: 10,
        tags: undefined,
        cursor: undefined,
      });
    });

    it('passes --tags option to listWorkflows', async () => {
      await runCommand(['workflows', 'list', '--tags', 'production,active']);

      expect(mockClient.listWorkflows).toHaveBeenCalledWith({
        active: undefined,
        limit: undefined,
        tags: 'production,active',
        cursor: undefined,
      });
    });

    it('uses table format by default', async () => {
      await runCommand(['workflows', 'list']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflows, 'table', 'workflows');
    });

    it('uses json format with --json flag', async () => {
      await runCommand(['workflows', 'list', '--json']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflows, 'json', 'workflows');
    });

    it('uses specified format with -f option', async () => {
      await runCommand(['workflows', 'list', '-f', 'minimal']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflows, 'minimal', 'workflows');
    });

    it('outputs formatOutput result to console.log', async () => {
      await runCommand(['workflows', 'list']);

      expect(consoleLogSpy).toHaveBeenCalledWith('formatted output');
    });

    it('passes --cursor option to listWorkflows', async () => {
      await runCommand(['workflows', 'list', '--cursor', 'abc123']);

      expect(mockClient.listWorkflows).toHaveBeenCalledWith({
        active: undefined,
        limit: undefined,
        tags: undefined,
        cursor: 'abc123',
      });
    });
  });

  describe('workflows get', () => {
    beforeEach(() => {
      mockClient.getWorkflow.mockResolvedValue(mockWorkflow);
    });

    it('creates client and calls getWorkflow with ID argument', async () => {
      await runCommand(['workflows', 'get', 'wf-123']);

      expect(createClient).toHaveBeenCalled();
      expect(mockClient.getWorkflow).toHaveBeenCalledWith('wf-123');
    });

    it('uses detail format by default', async () => {
      await runCommand(['workflows', 'get', 'wf-123']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflow, 'detail', 'workflow');
    });

    it('uses json format with --json flag', async () => {
      await runCommand(['workflows', 'get', 'wf-123', '--json']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflow, 'json', 'workflow');
    });

    it('outputs formatOutput result to console.log', async () => {
      await runCommand(['workflows', 'get', 'wf-123']);

      expect(consoleLogSpy).toHaveBeenCalledWith('formatted output');
    });
  });
});
