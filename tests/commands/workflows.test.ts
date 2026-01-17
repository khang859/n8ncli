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
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';

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

  describe('workflows create', () => {
    const mockWorkflowJson = JSON.stringify({
      name: 'New Workflow',
      nodes: [],
      connections: {},
    });

    beforeEach(() => {
      mockClient.createWorkflow.mockResolvedValue(mockWorkflow);
    });

    it('reads file and calls createWorkflow with parsed JSON data', async () => {
      vi.mocked(readFile).mockResolvedValue(mockWorkflowJson);

      await runCommand(['workflows', 'create', '-f', '/path/to/workflow.json']);

      expect(readFile).toHaveBeenCalledWith('/path/to/workflow.json', 'utf-8');
      expect(mockClient.createWorkflow).toHaveBeenCalledWith({
        name: 'New Workflow',
        nodes: [],
        connections: {},
      });
    });

    it('throws error for file not found (ENOENT)', async () => {
      const enoentError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      vi.mocked(readFile).mockRejectedValue(enoentError);

      await expect(runCommand(['workflows', 'create', '-f', '/nonexistent.json']))
        .rejects.toThrow('File not found: /nonexistent.json');
    });

    it('throws error for invalid JSON', async () => {
      vi.mocked(readFile).mockResolvedValue('{ invalid json }');

      await expect(runCommand(['workflows', 'create', '-f', '/path/to/invalid.json']))
        .rejects.toThrow('Invalid JSON in file:');
    });

    it('uses detail format by default', async () => {
      vi.mocked(readFile).mockResolvedValue(mockWorkflowJson);

      await runCommand(['workflows', 'create', '-f', '/path/to/workflow.json']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflow, 'detail', 'workflow');
    });

    it('uses json format with --json flag', async () => {
      vi.mocked(readFile).mockResolvedValue(mockWorkflowJson);

      await runCommand(['workflows', 'create', '-f', '/path/to/workflow.json', '--json']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflow, 'json', 'workflow');
    });

    it('outputs formatOutput result to console.log', async () => {
      vi.mocked(readFile).mockResolvedValue(mockWorkflowJson);

      await runCommand(['workflows', 'create', '-f', '/path/to/workflow.json']);

      expect(consoleLogSpy).toHaveBeenCalledWith('formatted output');
    });
  });

  describe('workflows update', () => {
    const mockUpdateJson = JSON.stringify({
      name: 'Updated Workflow',
      nodes: [{ id: 'node-1', name: 'Start', type: 'n8n-nodes-base.start', position: [0, 0] }],
    });

    beforeEach(() => {
      mockClient.updateWorkflow.mockResolvedValue(mockWorkflow);
    });

    it('reads file and calls updateWorkflow with ID argument and parsed JSON data', async () => {
      vi.mocked(readFile).mockResolvedValue(mockUpdateJson);

      await runCommand(['workflows', 'update', 'wf-123', '-f', '/path/to/update.json']);

      expect(readFile).toHaveBeenCalledWith('/path/to/update.json', 'utf-8');
      expect(mockClient.updateWorkflow).toHaveBeenCalledWith('wf-123', {
        name: 'Updated Workflow',
        nodes: [{ id: 'node-1', name: 'Start', type: 'n8n-nodes-base.start', position: [0, 0] }],
      });
    });

    it('throws error for file not found', async () => {
      const enoentError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      vi.mocked(readFile).mockRejectedValue(enoentError);

      await expect(runCommand(['workflows', 'update', 'wf-123', '-f', '/nonexistent.json']))
        .rejects.toThrow('File not found: /nonexistent.json');
    });

    it('throws error for invalid JSON', async () => {
      vi.mocked(readFile).mockResolvedValue('not valid json');

      await expect(runCommand(['workflows', 'update', 'wf-123', '-f', '/invalid.json']))
        .rejects.toThrow('Invalid JSON in file:');
    });

    it('uses detail format by default', async () => {
      vi.mocked(readFile).mockResolvedValue(mockUpdateJson);

      await runCommand(['workflows', 'update', 'wf-123', '-f', '/path/to/update.json']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflow, 'detail', 'workflow');
    });

    it('uses json format with --json flag', async () => {
      vi.mocked(readFile).mockResolvedValue(mockUpdateJson);

      await runCommand(['workflows', 'update', 'wf-123', '-f', '/path/to/update.json', '--json']);

      expect(formatOutput).toHaveBeenCalledWith(mockWorkflow, 'json', 'workflow');
    });
  });

  describe('workflows delete', () => {
    let mockRl: {
      question: ReturnType<typeof vi.fn>;
      close: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockClient.deleteWorkflow.mockResolvedValue(undefined);
      mockRl = {
        question: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(createInterface).mockReturnValue(mockRl as unknown as ReturnType<typeof createInterface>);
    });

    it('with --force: calls deleteWorkflow without prompt', async () => {
      await runCommand(['workflows', 'delete', 'wf-123', '--force']);

      expect(createInterface).not.toHaveBeenCalled();
      expect(mockClient.deleteWorkflow).toHaveBeenCalledWith('wf-123');
    });

    it('without --force: prompts user, y confirms deletion', async () => {
      mockRl.question.mockResolvedValue('y');

      await runCommand(['workflows', 'delete', 'wf-123']);

      expect(createInterface).toHaveBeenCalled();
      expect(mockRl.question).toHaveBeenCalledWith('Delete workflow wf-123? (y/N): ');
      expect(mockClient.deleteWorkflow).toHaveBeenCalledWith('wf-123');
      expect(mockRl.close).toHaveBeenCalled();
    });

    it('without --force: prompts user, n aborts', async () => {
      mockRl.question.mockResolvedValue('n');

      await runCommand(['workflows', 'delete', 'wf-123']);

      expect(createInterface).toHaveBeenCalled();
      expect(mockRl.question).toHaveBeenCalledWith('Delete workflow wf-123? (y/N): ');
      expect(mockClient.deleteWorkflow).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Aborted.');
      expect(mockRl.close).toHaveBeenCalled();
    });

    it('outputs deletion confirmation message', async () => {
      await runCommand(['workflows', 'delete', 'wf-123', '--force']);

      expect(consoleLogSpy).toHaveBeenCalledWith('Workflow wf-123 deleted');
    });

    it('outputs JSON with --json flag', async () => {
      await runCommand(['workflows', 'delete', 'wf-123', '--force', '--json']);

      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({ deleted: true, id: 'wf-123' }));
    });

    it('with -f short flag: calls deleteWorkflow without prompt', async () => {
      await runCommand(['workflows', 'delete', 'wf-123', '-f']);

      expect(createInterface).not.toHaveBeenCalled();
      expect(mockClient.deleteWorkflow).toHaveBeenCalledWith('wf-123');
    });
  });

  describe('workflows activate', () => {
    beforeEach(() => {
      mockClient.activateWorkflow.mockResolvedValue({ ...mockWorkflow, active: true });
    });

    it('calls activateWorkflow with ID argument', async () => {
      await runCommand(['workflows', 'activate', 'wf-123']);

      expect(createClient).toHaveBeenCalled();
      expect(mockClient.activateWorkflow).toHaveBeenCalledWith('wf-123');
    });

    it('uses detail format by default', async () => {
      await runCommand(['workflows', 'activate', 'wf-123']);

      expect(formatOutput).toHaveBeenCalledWith(
        expect.objectContaining({ active: true }),
        'detail',
        'workflow'
      );
    });

    it('uses json format with --json flag', async () => {
      await runCommand(['workflows', 'activate', 'wf-123', '--json']);

      expect(formatOutput).toHaveBeenCalledWith(
        expect.objectContaining({ active: true }),
        'json',
        'workflow'
      );
    });

    it('outputs formatOutput result to console.log', async () => {
      await runCommand(['workflows', 'activate', 'wf-123']);

      expect(consoleLogSpy).toHaveBeenCalledWith('formatted output');
    });
  });

  describe('workflows deactivate', () => {
    beforeEach(() => {
      mockClient.deactivateWorkflow.mockResolvedValue({ ...mockWorkflow, active: false });
    });

    it('calls deactivateWorkflow with ID argument', async () => {
      await runCommand(['workflows', 'deactivate', 'wf-123']);

      expect(createClient).toHaveBeenCalled();
      expect(mockClient.deactivateWorkflow).toHaveBeenCalledWith('wf-123');
    });

    it('uses detail format by default', async () => {
      await runCommand(['workflows', 'deactivate', 'wf-123']);

      expect(formatOutput).toHaveBeenCalledWith(
        expect.objectContaining({ active: false }),
        'detail',
        'workflow'
      );
    });

    it('uses json format with --json flag', async () => {
      await runCommand(['workflows', 'deactivate', 'wf-123', '--json']);

      expect(formatOutput).toHaveBeenCalledWith(
        expect.objectContaining({ active: false }),
        'json',
        'workflow'
      );
    });

    it('outputs formatOutput result to console.log', async () => {
      await runCommand(['workflows', 'deactivate', 'wf-123']);

      expect(consoleLogSpy).toHaveBeenCalledWith('formatted output');
    });
  });
});
