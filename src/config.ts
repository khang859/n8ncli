import { loadPersistedConfig } from './utils/configStore.js';

export interface N8nConfig {
  host: string;
  apiKey: string;
}

export type ConfigSource = 'cli' | 'env' | 'file' | 'missing';

export interface N8nConfigWithSources {
  host: string;
  apiKey: string;
  hostSource: ConfigSource;
  apiKeySource: ConfigSource;
}

export interface CliConfigOptions {
  host?: string;
  apiKey?: string;
}

/**
 * Load configuration with source tracking
 * Priority: CLI flags > environment variables > persisted config file
 */
export function loadConfigWithSources(cliOptions?: CliConfigOptions): N8nConfigWithSources {
  const persisted = loadPersistedConfig();

  let host: string | undefined;
  let hostSource: ConfigSource = 'missing';

  // CLI flags have highest priority
  if (cliOptions?.host) {
    host = cliOptions.host;
    hostSource = 'cli';
  } else if (process.env.N8N_HOST) {
    host = process.env.N8N_HOST;
    hostSource = 'env';
  } else if (persisted.host) {
    host = persisted.host;
    hostSource = 'file';
  }

  let apiKey: string | undefined;
  let apiKeySource: ConfigSource = 'missing';

  if (cliOptions?.apiKey) {
    apiKey = cliOptions.apiKey;
    apiKeySource = 'cli';
  } else if (process.env.N8N_API_KEY) {
    apiKey = process.env.N8N_API_KEY;
    apiKeySource = 'env';
  } else if (persisted.apiKey) {
    apiKey = persisted.apiKey;
    apiKeySource = 'file';
  }

  return {
    host: host ?? '',
    apiKey: apiKey ?? '',
    hostSource,
    apiKeySource,
  };
}

/**
 * Load configuration (throws if required values are missing)
 * Priority: CLI flags > environment variables > persisted config file
 */
export function loadConfig(cliOptions?: CliConfigOptions): N8nConfig {
  const config = loadConfigWithSources(cliOptions);

  if (!config.host) {
    throw new Error('N8N_HOST is required');
  }

  if (!config.apiKey) {
    throw new Error('N8N_API_KEY is required');
  }

  return { host: config.host, apiKey: config.apiKey };
}
