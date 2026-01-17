import type { Command } from 'commander';
import chalk from 'chalk';
import { noColor } from '../utils/env.js';
import { loadConfigWithSources, type ConfigSource } from '../config.js';
import {
  getConfigPath,
  setConfigValue,
  clearConfig,
  maskApiKey,
  validateHost,
  normalizeKey,
} from '../utils/configStore.js';

// Conditionally apply colors
const bold = noColor ? (s: string) => s : chalk.bold;
const gray = noColor ? (s: string) => s : chalk.gray;
const green = noColor ? (s: string) => s : chalk.green;
const yellow = noColor ? (s: string) => s : chalk.yellow;
const red = noColor ? (s: string) => s : chalk.red;

function formatSource(source: ConfigSource): string {
  switch (source) {
    case 'cli':
      return '--host/--api-key flag';
    case 'env':
      return 'environment variable';
    case 'file':
      return `config file (${getConfigPath()})`;
    case 'missing':
      return 'not set';
  }
}

export function registerConfigCommand(program: Command): void {
  const configCmd = program.command('config').description('Manage n8ncli configuration');

  // config show (default behavior)
  configCmd
    .command('show', { isDefault: true })
    .description('Show current configuration')
    .option('--json', 'Output as JSON')
    .action((options: { json?: boolean }) => {
      const config = loadConfigWithSources();

      const displayConfig = {
        host: config.host || '(not set)',
        apiKey: config.apiKey ? maskApiKey(config.apiKey) : '(not set)',
        hostSource: formatSource(config.hostSource),
        apiKeySource: formatSource(config.apiKeySource),
      };

      if (options.json) {
        console.log(JSON.stringify(displayConfig, null, 2));
        return;
      }

      console.log(bold('Current Configuration'));
      console.log('─'.repeat(40));
      console.log(`${gray('Host:')}     ${displayConfig.host}`);
      console.log(`${gray('API Key:')}  ${displayConfig.apiKey}`);
      console.log();
      console.log(gray('Sources:'));
      console.log(`  Host:    ${displayConfig.hostSource}`);
      console.log(`  API Key: ${displayConfig.apiKeySource}`);
    });

  // config set <key> <value>
  configCmd
    .command('set <key> <value>')
    .description('Set a configuration value (host or apikey)')
    .action((key: string, value: string) => {
      const normalized = normalizeKey(key);

      if (!normalized.valid) {
        console.error(red(`Error: ${normalized.error}`));
        process.exit(2);
      }

      // Validate host URL
      if (normalized.key === 'host') {
        const validation = validateHost(value);
        if (!validation.valid) {
          console.error(red(`Error: ${validation.error}`));
          console.error(gray('Host must be a valid URL (e.g., https://n8n.example.com/api/v1)'));
          process.exit(2);
        }
      }

      // Validate API key is not empty
      if (normalized.key === 'apiKey' && !value.trim()) {
        console.error(red('Error: API key cannot be empty'));
        process.exit(2);
      }

      setConfigValue(normalized.key, value);

      const displayValue = normalized.key === 'apiKey' ? maskApiKey(value) : value;
      console.log(green(`Set ${normalized.key} to ${displayValue}`));
      console.log(gray(`Saved to ${getConfigPath()}`));
    });

  // config path
  configCmd
    .command('path')
    .description('Show configuration file location')
    .action(() => {
      console.log(getConfigPath());
    });

  // config clear
  configCmd
    .command('clear')
    .description('Remove persisted configuration')
    .action(() => {
      const cleared = clearConfig();

      if (cleared) {
        console.log(green('Configuration cleared'));
        console.log(gray(`Removed ${getConfigPath()}`));
      } else {
        console.log(yellow('No configuration file to clear'));
      }
    });
}
