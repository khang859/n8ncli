import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface PersistedConfig {
  host?: string;
  apiKey?: string;
}

const CONFIG_FILENAME = '.n8ncli.json';

/**
 * Get the path to the config file (~/.n8ncli.json)
 */
export function getConfigPath(): string {
  return path.join(os.homedir(), CONFIG_FILENAME);
}

/**
 * Check if file permissions are too open (group or other readable)
 * Returns true if permissions are secure, false if too open
 */
function checkPermissions(filePath: string): { secure: boolean; mode?: number } {
  try {
    const stats = fs.statSync(filePath);
    const mode = stats.mode & 0o777;
    // Check if group or other has any permissions
    const hasGroupOrOther = (mode & 0o077) !== 0;
    return { secure: !hasGroupOrOther, mode };
  } catch {
    return { secure: true }; // File doesn't exist, which is fine
  }
}

/**
 * Load persisted config from disk
 * Returns empty object if file doesn't exist
 */
export function loadPersistedConfig(): PersistedConfig {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return {};
  }

  // Check permissions and warn if too open
  const permCheck = checkPermissions(configPath);
  if (!permCheck.secure && permCheck.mode !== undefined) {
    const modeStr = permCheck.mode.toString(8).padStart(3, '0');
    console.error(
      `Warning: Config file ${configPath} has permissions ${modeStr}, which are too open.`,
    );
    console.error('It is recommended that your config file is NOT accessible by others.');
    console.error('Run: chmod 600 ~/.n8ncli.json');
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(content) as PersistedConfig;
    return {
      host: typeof parsed.host === 'string' ? parsed.host : undefined,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : undefined,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`Warning: Config file ${configPath} contains invalid JSON`);
    }
    return {};
  }
}

/**
 * Save config to disk with secure permissions (0600)
 */
export function savePersistedConfig(config: PersistedConfig): void {
  const configPath = getConfigPath();
  const content = JSON.stringify(config, null, 2) + '\n';

  // Write with restricted permissions (owner read/write only)
  fs.writeFileSync(configPath, content, { mode: 0o600 });
}

/**
 * Set a single config value
 */
export function setConfigValue(key: 'host' | 'apiKey', value: string): void {
  const current = loadPersistedConfig();
  current[key] = value;
  savePersistedConfig(current);
}

/**
 * Clear (delete) the config file
 */
export function clearConfig(): boolean {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return false; // Nothing to clear
  }

  fs.unlinkSync(configPath);
  return true;
}

/**
 * Mask an API key for display (show first 8 and last 4 chars)
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) {
    return '***';
  }
  return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
}

/**
 * Validate that a string is a valid URL
 */
export function validateHost(host: string): { valid: boolean; error?: string } {
  try {
    new URL(host);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Normalize key aliases to standard keys
 */
export function normalizeKey(
  key: string,
): { key: 'host' | 'apiKey'; valid: true } | { valid: false; error: string } {
  const normalized = key.toLowerCase();

  if (normalized === 'host' || normalized === 'n8nhost') {
    return { key: 'host', valid: true };
  }

  if (normalized === 'apikey' || normalized === 'n8nkey') {
    return { key: 'apiKey', valid: true };
  }

  return {
    valid: false,
    error: `Unknown config key: ${key}. Valid keys: host, apikey`,
  };
}
