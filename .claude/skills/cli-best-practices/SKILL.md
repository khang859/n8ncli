---
name: cli-best-practices
description: Build production-quality Node.js/TypeScript CLI applications following best practices. Use when creating command-line tools, adding CLI commands, or reviewing CLI code for proper argument parsing, error handling, output formatting, and user experience.
---

# CLI Best Practices

Build robust, user-friendly command-line interfaces in Node.js/TypeScript.

## Core Principles

### 1. Fail Fast with Clear Errors

Validate inputs early and exit with meaningful messages:

```typescript
if (!options.input) {
  console.error('Error: --input is required');
  console.error('Run with --help for usage information');
  process.exit(2); // 2 = misuse
}

if (!fs.existsSync(options.input)) {
  console.error(`Error: File not found: ${options.input}`);
  process.exit(1);
}
```

**Exit codes:**
- `0` = success
- `1` = general error
- `2` = misuse (bad arguments)

### 2. Follow the Principle of Least Surprise

Use conventional flag names:

```typescript
program
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Suppress all output')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --force', 'Overwrite existing files')
  .option('-n, --dry-run', 'Show what would be done')
  .option('--json', 'Output as JSON')
  .option('-h, --help', 'Show help')  // Usually auto-generated
  .option('-V, --version', 'Show version')  // Usually auto-generated
```

### 3. Be Quiet by Default

Only output what's necessary:

```typescript
const isVerbose = options.verbose || process.env.DEBUG;

function log(message: string) {
  if (isVerbose) {
    console.error(`[debug] ${message}`);  // Logs to stderr
  }
}

// Results go to stdout (for piping)
console.log(result);
```

### 4. Support Interactive and Non-Interactive Modes

Detect TTY and adjust behavior:

```typescript
import { isatty } from 'tty';

const isInteractive = isatty(process.stdin.fd) && isatty(process.stdout.fd);
const isCi = process.env.CI === 'true';

// Skip prompts in non-interactive mode
if (!isInteractive || isCi) {
  if (!options.confirm) {
    console.error('Error: --confirm required in non-interactive mode');
    process.exit(2);
  }
} else {
  const answer = await confirm('Proceed?');
}

// Skip spinners in CI
if (isInteractive && !isCi) {
  spinner.start('Processing...');
} else {
  console.error('Processing...');
}
```

### 5. Make It Composable

Support machine-readable output:

```typescript
if (options.json) {
  // Clean JSON to stdout for piping to jq
  console.log(JSON.stringify(results, null, 2));
} else {
  // Human-readable format
  for (const item of results) {
    console.log(`${item.name}: ${item.value}`);
  }
}
```

### 6. Respect the User's Environment

Honor environment variables and standards:

```typescript
import { homedir } from 'os';
import { join } from 'path';

// Respect XDG spec
const configDir = process.env.XDG_CONFIG_HOME
  || join(homedir(), '.config');

// Honor NO_COLOR
const useColor = !process.env.NO_COLOR && isatty(process.stdout.fd);

// Respect EDITOR
const editor = process.env.EDITOR || process.env.VISUAL || 'vi';

// Don't hardcode paths
const cacheDir = process.env.XDG_CACHE_HOME
  || join(homedir(), '.cache');
```

### 7. Provide Sensible Defaults

Zero-config should work for 80% of cases:

```typescript
const defaults = {
  output: './output',
  format: 'json',
  timeout: 30000,
  retries: 3,
};

const config = { ...defaults, ...userConfig, ...cliOptions };
```

### 8. Handle Interrupts Gracefully

Clean up on SIGINT/SIGTERM:

```typescript
let cleanupFn: (() => void) | null = null;

function handleShutdown(signal: string) {
  console.error(`\nReceived ${signal}, cleaning up...`);
  if (cleanupFn) cleanupFn();
  process.exit(130); // 128 + signal number (2 for SIGINT)
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Register cleanup
cleanupFn = () => {
  fs.rmSync(tempDir, { recursive: true, force: true });
};
```

## Recommended Libraries

### Argument Parsing

```typescript
// commander - most popular, full-featured
import { program } from 'commander';

program
  .name('mycli')
  .description('Does useful things')
  .version('1.0.0')
  .argument('<input>', 'Input file')
  .option('-o, --output <file>', 'Output file', 'output.json')
  .action(async (input, options) => {
    // ...
  });

program.parse();
```

```typescript
// citty - lighter weight alternative
import { defineCommand, runMain } from 'citty';

const main = defineCommand({
  meta: { name: 'mycli', version: '1.0.0', description: 'Does things' },
  args: {
    input: { type: 'positional', required: true },
    output: { type: 'string', alias: 'o', default: 'output.json' },
  },
  run({ args }) {
    // ...
  },
});

runMain(main);
```

### Configuration

```typescript
// cosmiconfig - find config in multiple places
import { cosmiconfig } from 'cosmiconfig';

const explorer = cosmiconfig('mycli');
const result = await explorer.search();
// Searches: .myclirc, .myclirc.json, .myclirc.yaml,
// mycli.config.js, package.json#mycli

const config = result?.config ?? {};
```

### Colors and Formatting

```typescript
// picocolors - tiny, fast
import pc from 'picocolors';

// Automatically respects NO_COLOR
console.log(pc.green('Success!'));
console.log(pc.red('Error:'), message);
console.log(pc.dim('Hint:'), hint);
```

```typescript
// chalk - more features
import chalk from 'chalk';

console.log(chalk.bold.green('Success!'));
console.log(chalk.red.bgWhite('Error'));
```

### Progress Indication

```typescript
// ora - spinners
import ora from 'ora';

const spinner = ora('Loading...').start();
try {
  await doWork();
  spinner.succeed('Done!');
} catch (err) {
  spinner.fail('Failed');
}
```

```typescript
// cli-progress - progress bars
import { SingleBar, Presets } from 'cli-progress';

const bar = new SingleBar({}, Presets.shades_classic);
bar.start(100, 0);
bar.update(50);
bar.stop();
```

### Update Notifications

```typescript
// update-notifier - non-blocking update checks
import updateNotifier from 'update-notifier';
import pkg from './package.json';

updateNotifier({ pkg }).notify();
// Shows: "Update available: 1.0.0 → 2.0.0"
```

## Complete Example

```typescript
#!/usr/bin/env node
import { program } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import pc from 'picocolors';
import ora from 'ora';
import { isatty } from 'tty';

// Environment detection
const isInteractive = isatty(process.stdout.fd);
const isCi = process.env.CI === 'true';
const useColor = !process.env.NO_COLOR && isInteractive;

// Graceful shutdown
let cleanup: (() => void) | null = null;
process.on('SIGINT', () => {
  console.error('\nInterrupted');
  cleanup?.();
  process.exit(130);
});

program
  .name('mycli')
  .description('A well-behaved CLI tool')
  .version('1.0.0')
  .argument('<input>', 'Input file to process')
  .option('-o, --output <file>', 'Output file')
  .option('-v, --verbose', 'Verbose output')
  .option('--json', 'Output as JSON')
  .option('--no-color', 'Disable colors')
  .action(async (input, options) => {
    // Load config
    const explorer = cosmiconfig('mycli');
    const configResult = await explorer.search();
    const config = { ...configResult?.config, ...options };

    // Validate early
    if (!input) {
      console.error(pc.red('Error: Input file required'));
      process.exit(2);
    }

    // Progress indication (interactive only)
    const spinner = isInteractive && !isCi
      ? ora('Processing...').start()
      : null;

    if (!spinner) {
      console.error('Processing...');
    }

    try {
      const result = await processFile(input, config);

      spinner?.succeed('Done');

      // Output to stdout
      if (config.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Processed: ${result.count} items`);
      }

      process.exit(0);
    } catch (err) {
      spinner?.fail('Failed');
      console.error(pc.red('Error:'), err.message);
      if (config.verbose) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  });

program.parse();
```

## Checklist

When building or reviewing a CLI, verify:

- [ ] Uses argument parser (commander, yargs, citty)
- [ ] Has --help with descriptions for all flags
- [ ] Has --version flag
- [ ] Uses conventional flag names (-v, -o, -f, -q)
- [ ] Validates inputs early with clear error messages
- [ ] Uses correct exit codes (0, 1, 2)
- [ ] Results → stdout, logs/errors → stderr
- [ ] Supports --json for machine-readable output
- [ ] Respects NO_COLOR environment variable
- [ ] Detects TTY for interactive features
- [ ] Skips spinners/prompts in CI
- [ ] Handles SIGINT/SIGTERM gracefully
- [ ] Supports config file (.myclirc or similar)
- [ ] Supports env var overrides (MY_CLI_*)
- [ ] Doesn't hardcode paths (respects XDG spec)
- [ ] Has sensible defaults (zero-config works)
