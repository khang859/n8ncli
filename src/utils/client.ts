import { N8nApiClient } from '../client/index.js';
import { loadConfig } from '../config.js';

export interface GlobalOptions {
  host?: string;
  apiKey?: string;
  verbose?: boolean;
  quiet?: boolean;
}

export function createClient(options: GlobalOptions): N8nApiClient {
  const config = loadConfig();

  return new N8nApiClient({
    baseUrl: options.host ?? config.host,
    apiKey: options.apiKey ?? config.apiKey,
  });
}

/**
 * Log a debug message (only in verbose mode)
 */
export function debug(options: GlobalOptions, message: string): void {
  if (options.verbose && !options.quiet) {
    console.error(`[debug] ${message}`);
  }
}

/**
 * Log an info message (suppressed in quiet mode)
 */
export function info(options: GlobalOptions, message: string): void {
  if (!options.quiet) {
    console.error(message);
  }
}
