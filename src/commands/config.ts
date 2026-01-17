import type { Command } from 'commander';
import chalk from 'chalk';
import { noColor } from '../utils/env.js';

// Conditionally apply colors
const bold = noColor ? (s: string) => s : chalk.bold;
const gray = noColor ? (s: string) => s : chalk.gray;

export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('Show current configuration')
    .option('--json', 'Output as JSON')
    .action((options: { json?: boolean }) => {
      const host = process.env.N8N_HOST;
      const apiKey = process.env.N8N_API_KEY;

      const config = {
        host: host ?? '(not set)',
        apiKey: apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : '(not set)',
        hostSource: host ? 'N8N_HOST env var' : 'missing',
        apiKeySource: apiKey ? 'N8N_API_KEY env var' : 'missing',
      };

      if (options.json) {
        console.log(JSON.stringify(config, null, 2));
        return;
      }

      console.log(bold('Current Configuration'));
      console.log('─'.repeat(40));
      console.log(`${gray('Host:')}     ${config.host}`);
      console.log(`${gray('API Key:')}  ${config.apiKey}`);
      console.log();
      console.log(gray('Sources:'));
      console.log(`  Host:    ${config.hostSource}`);
      console.log(`  API Key: ${config.apiKeySource}`);
    });
}
