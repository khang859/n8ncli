import { Command } from 'commander';
import chalk from 'chalk';
import { registerWorkflowCommands } from './commands/workflows.js';
import { registerTestCommand } from './commands/test.js';
import { registerConfigCommand } from './commands/config.js';
import { handleError } from './utils/errors.js';
import { noColor } from './utils/env.js';

// Conditionally apply colors
const red = noColor ? (s: string) => s : chalk.red;

// Track cleanup functions for graceful shutdown
let cleanupFn: (() => void) | null = null;

/**
 * Register a cleanup function to be called on shutdown
 */
export function registerCleanup(fn: () => void): void {
  cleanupFn = fn;
}

/**
 * Handle graceful shutdown on SIGINT/SIGTERM
 */
function handleShutdown(signal: string): void {
  console.error(`\nReceived ${signal}, shutting down...`);
  if (cleanupFn) {
    cleanupFn();
  }
  // Exit code 130 = 128 + 2 (SIGINT signal number)
  process.exit(signal === 'SIGINT' ? 130 : 143);
}

// Register signal handlers
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

const program = new Command()
  .name('n8ncli')
  .description('CLI for interacting with the n8n API')
  .version('1.0.0')
  .option('--host <url>', 'n8n instance URL (overrides N8N_HOST)')
  .option('--api-key <key>', 'API key (overrides N8N_API_KEY)')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Suppress non-essential output')
  .configureOutput({
    outputError: (str, write) => write(red(str)),
  });

registerWorkflowCommands(program);
registerTestCommand(program);
registerConfigCommand(program);

export { program };

export async function run(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    handleError(error);
  }
}
