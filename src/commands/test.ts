import type { Command } from 'commander';
import chalk from 'chalk';
import { createClient, debug, type GlobalOptions } from '../utils/client.js';
import { noColor } from '../utils/env.js';
import { ExitCode } from '../utils/errors.js';

// Conditionally apply colors
const green = noColor ? (s: string) => s : chalk.green;
const red = noColor ? (s: string) => s : chalk.red;
const gray = noColor ? (s: string) => s : chalk.gray;

export function registerTestCommand(program: Command): void {
  program
    .command('test')
    .description('Test connection to n8n API')
    .option('--json', 'Output as JSON')
    .action(async (options: { json?: boolean }) => {
      const globalOpts = program.opts() as GlobalOptions;

      debug(globalOpts, 'Testing connection to n8n API...');

      const client = createClient(globalOpts);
      const result = await client.testConnection();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? ExitCode.SUCCESS : ExitCode.ERROR);
      }

      if (result.success) {
        console.log(green('✓'), 'Connection successful');
        if (!globalOpts.quiet) {
          console.log(gray('  Message:'), result.message);
        }
        process.exit(ExitCode.SUCCESS);
      } else {
        console.log(red('✗'), 'Connection failed');
        console.log(gray('  Message:'), result.message);
        process.exit(ExitCode.ERROR);
      }
    });
}
