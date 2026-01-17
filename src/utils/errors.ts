import chalk from 'chalk';
import {
  N8nApiError,
  N8nAuthenticationError,
  N8nConnectionError,
} from '../errors/index.js';
import { noColor } from './env.js';

// Conditionally apply colors based on NO_COLOR
const red = noColor ? (s: string) => s : chalk.red;
const gray = noColor ? (s: string) => s : chalk.gray;

/**
 * Exit codes following conventions:
 * - 0: Success
 * - 1: General error
 * - 2: Misuse (bad arguments, missing config)
 */
export const ExitCode = {
  SUCCESS: 0,
  ERROR: 1,
  MISUSE: 2,
} as const;

export type ExitCodeType = (typeof ExitCode)[keyof typeof ExitCode];

export interface ErrorResult {
  message: string;
  hint?: string;
  exitCode: ExitCodeType;
}

/**
 * Analyze an error and return structured information
 */
export function analyzeError(error: unknown): ErrorResult {
  if (error instanceof N8nAuthenticationError) {
    return {
      message: `Authentication Error: ${error.message}`,
      hint: 'Check your N8N_API_KEY environment variable or --api-key flag',
      exitCode: ExitCode.MISUSE,
    };
  }

  if (error instanceof N8nConnectionError) {
    return {
      message: `Connection Error: ${error.message}`,
      hint: 'Verify N8N_HOST is correct and n8n is running',
      exitCode: ExitCode.ERROR,
    };
  }

  if (error instanceof N8nApiError) {
    return {
      message: `API Error (${error.statusCode}): ${error.message}`,
      exitCode: ExitCode.ERROR,
    };
  }

  if (error instanceof Error) {
    if (error.message.includes('environment variable is required')) {
      return {
        message: `Configuration Error: ${error.message}`,
        hint: 'Set N8N_HOST and N8N_API_KEY environment variables',
        exitCode: ExitCode.MISUSE,
      };
    }
    return {
      message: `Error: ${error.message}`,
      exitCode: ExitCode.ERROR,
    };
  }

  return {
    message: 'Unknown error occurred',
    exitCode: ExitCode.ERROR,
  };
}

/**
 * Handle an error by printing to stderr and exiting
 */
export function handleError(error: unknown): never {
  const result = analyzeError(error);

  console.error(red(result.message));
  if (result.hint) {
    console.error(gray(`Hint: ${result.hint}`));
  }

  process.exit(result.exitCode);
}

/**
 * Print an error without exiting (for non-fatal errors)
 */
export function printError(error: unknown): void {
  const result = analyzeError(error);

  console.error(red(result.message));
  if (result.hint) {
    console.error(gray(`Hint: ${result.hint}`));
  }
}
