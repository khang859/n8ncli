import type { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createClient, debug, type GlobalOptions } from '../utils/client.js';
import { formatOutput, type OutputFormat } from '../utils/output.js';
import type { WorkflowCreateInput, WorkflowUpdateInput } from '../client/types.js';

export function registerWorkflowCommands(program: Command): void {
  const workflows = program
    .command('workflows')
    .description('Manage n8n workflows');

  workflows
    .command('list')
    .description('List all workflows')
    .option('--active', 'Show only active workflows')
    .option('--inactive', 'Show only inactive workflows')
    .option('-l, --limit <number>', 'Limit number of results', parseInt)
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('--cursor <cursor>', 'Pagination cursor')
    .option('--json', 'Output as JSON')
    .option('-f, --format <format>', 'Output format: table, json, minimal', 'table')
    .action(async (options) => {
      const globalOpts = program.opts() as GlobalOptions;

      debug(globalOpts, 'Fetching workflows...');

      const client = createClient(globalOpts);

      const workflows = await client.listWorkflows({
        active: options.active ? true : options.inactive ? false : undefined,
        limit: options.limit,
        tags: options.tags,
        cursor: options.cursor,
      });

      debug(globalOpts, `Found ${workflows.length} workflows`);

      const format: OutputFormat = options.json ? 'json' : (options.format as OutputFormat);
      console.log(formatOutput(workflows, format, 'workflows'));
    });

  workflows
    .command('get')
    .description('Get a specific workflow by ID')
    .argument('<id>', 'Workflow ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options: { json?: boolean }) => {
      const globalOpts = program.opts() as GlobalOptions;

      debug(globalOpts, `Fetching workflow ${id}...`);

      const client = createClient(globalOpts);

      const workflow = await client.getWorkflow(id);

      const format: OutputFormat = options.json ? 'json' : 'detail';
      console.log(formatOutput(workflow, format, 'workflow'));
    });

  workflows
    .command('create')
    .description('Create a new workflow from a JSON file')
    .requiredOption('-f, --file <path>', 'Path to workflow JSON file')
    .option('--json', 'Output as JSON')
    .action(async (options: { file: string; json?: boolean }) => {
      const globalOpts = program.opts() as GlobalOptions;

      debug(globalOpts, `Creating workflow from file: ${options.file}`);

      let fileContent: string;
      try {
        fileContent = await readFile(options.file, 'utf-8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new Error(`File not found: ${options.file}`);
        }
        throw error;
      }

      let data: WorkflowCreateInput;
      try {
        data = JSON.parse(fileContent) as WorkflowCreateInput;
      } catch (error) {
        throw new Error(`Invalid JSON in file: ${(error as Error).message}`);
      }

      const client = createClient(globalOpts);
      const workflow = await client.createWorkflow(data);

      debug(globalOpts, `Created workflow: ${workflow.id}`);

      const format: OutputFormat = options.json ? 'json' : 'detail';
      console.log(formatOutput(workflow, format, 'workflow'));
    });

  workflows
    .command('update')
    .description('Update an existing workflow from a JSON file')
    .argument('<id>', 'Workflow ID')
    .requiredOption('-f, --file <path>', 'Path to workflow JSON file')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options: { file: string; json?: boolean }) => {
      const globalOpts = program.opts() as GlobalOptions;

      debug(globalOpts, `Updating workflow ${id} from file: ${options.file}`);

      let fileContent: string;
      try {
        fileContent = await readFile(options.file, 'utf-8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new Error(`File not found: ${options.file}`);
        }
        throw error;
      }

      let data: WorkflowUpdateInput;
      try {
        data = JSON.parse(fileContent) as WorkflowUpdateInput;
      } catch (error) {
        throw new Error(`Invalid JSON in file: ${(error as Error).message}`);
      }

      const client = createClient(globalOpts);
      const workflow = await client.updateWorkflow(id, data);

      debug(globalOpts, `Updated workflow: ${workflow.id}`);

      const format: OutputFormat = options.json ? 'json' : 'detail';
      console.log(formatOutput(workflow, format, 'workflow'));
    });

  workflows
    .command('delete')
    .description('Delete a workflow by ID')
    .argument('<id>', 'Workflow ID')
    .option('--force, -f', 'Skip confirmation prompt')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options: { force?: boolean; json?: boolean }) => {
      const globalOpts = program.opts() as GlobalOptions;

      debug(globalOpts, `Deleting workflow ${id}...`);

      if (!options.force) {
        const rl = createInterface({ input, output });
        try {
          const answer = await rl.question(`Delete workflow ${id}? (y/N): `);
          if (answer.toLowerCase() !== 'y') {
            console.log('Aborted.');
            return;
          }
        } finally {
          rl.close();
        }
      }

      const client = createClient(globalOpts);
      await client.deleteWorkflow(id);

      debug(globalOpts, `Deleted workflow: ${id}`);

      if (options.json) {
        console.log(JSON.stringify({ deleted: true, id }));
      } else {
        console.log(`Workflow ${id} deleted`);
      }
    });

  workflows
    .command('activate')
    .description('Activate a workflow by ID')
    .argument('<id>', 'Workflow ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options: { json?: boolean }) => {
      const globalOpts = program.opts() as GlobalOptions;

      debug(globalOpts, `Activating workflow ${id}...`);

      const client = createClient(globalOpts);
      const workflow = await client.activateWorkflow(id);

      debug(globalOpts, `Activated workflow: ${id}`);

      const format: OutputFormat = options.json ? 'json' : 'detail';
      console.log(formatOutput(workflow, format, 'workflow'));
    });
}
