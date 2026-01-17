import { N8nApiClient } from '../client/index.js';
import { loadConfig } from '../config.js';

export interface GlobalOptions {
  host?: string;
  apiKey?: string;
  verbose?: boolean;
  quiet?: boolean;
}

export function createClient(options: GlobalOptions): N8nApiClient {
  // Pass CLI options to loadConfig for proper priority handling
  const config = loadConfig({
    host: options.host,
    apiKey: options.apiKey,
  });

  return new N8nApiClient({
    baseUrl: config.host,
    apiKey: config.apiKey,
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
