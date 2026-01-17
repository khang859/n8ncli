import type { Command } from 'commander';
import { createClient, debug, type GlobalOptions } from '../utils/client.js';
import { formatOutput, type OutputFormat } from '../utils/output.js';

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
}
