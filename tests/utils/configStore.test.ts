import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  getConfigPath,
  loadPersistedConfig,
  savePersistedConfig,
  setConfigValue,
  clearConfig,
  maskApiKey,
  validateHost,
  normalizeKey,
} from '../../src/utils/configStore.js';

// Mock the fs and os modules
vi.mock('node:fs');
vi.mock('node:os');

describe('configStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock for homedir
    vi.mocked(os.homedir).mockReturnValue('/home/testuser');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getConfigPath', () => {
    it('returns path in home directory', () => {
      const configPath = getConfigPath();
      expect(configPath).toBe('/home/testuser/.n8ncli.json');
    });

    it('uses correct home directory from os.homedir()', () => {
      vi.mocked(os.homedir).mockReturnValue('/Users/mac');
      const configPath = getConfigPath();
      expect(configPath).toBe('/Users/mac/.n8ncli.json');
    });
  });

  describe('loadPersistedConfig', () => {
    it('returns empty object when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = loadPersistedConfig();

      expect(config).toEqual({});
    });

    it('loads and parses valid config file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          host: 'https://n8n.example.com/api/v1',
          apiKey: 'test-api-key',
        }),
      );

      const config = loadPersistedConfig();

      expect(config).toEqual({
        host: 'https://n8n.example.com/api/v1',
        apiKey: 'test-api-key',
      });
    });

    it('returns empty object for invalid JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue('not valid json');

      // Capture console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const config = loadPersistedConfig();

      expect(config).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid JSON'),
      );
    });

    it('filters out non-string values', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          host: 123, // number instead of string
          apiKey: 'valid-key',
        }),
      );

      const config = loadPersistedConfig();

      expect(config).toEqual({
        host: undefined,
        apiKey: 'valid-key',
      });
    });

    it('warns when file permissions are too open', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      // Mode 0o644 means owner rw, group r, other r
      vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100644 } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ host: 'test' }));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      loadPersistedConfig();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('permissions'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('chmod 600'),
      );
    });

    it('does not warn when permissions are secure (0600)', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ host: 'test' }));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      loadPersistedConfig();

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('savePersistedConfig', () => {
    it('writes config with 0600 permissions', () => {
      savePersistedConfig({ host: 'https://example.com', apiKey: 'key123' });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/home/testuser/.n8ncli.json',
        expect.any(String),
        { mode: 0o600 },
      );
    });

    it('writes formatted JSON with trailing newline', () => {
      savePersistedConfig({ host: 'https://example.com' });

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('"host": "https://example.com"');
      expect(writtenContent.endsWith('\n')).toBe(true);
    });
  });

  describe('setConfigValue', () => {
    it('merges new value with existing config', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ host: 'existing-host' }),
      );

      setConfigValue('apiKey', 'new-key');

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      const parsed = JSON.parse(writtenContent);
      expect(parsed).toEqual({
        host: 'existing-host',
        apiKey: 'new-key',
      });
    });

    it('overwrites existing value', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ host: 'old-host' }),
      );

      setConfigValue('host', 'new-host');

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      const parsed = JSON.parse(writtenContent);
      expect(parsed.host).toBe('new-host');
    });
  });

  describe('clearConfig', () => {
    it('returns false when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = clearConfig();

      expect(result).toBe(false);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('deletes config file and returns true when it exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const result = clearConfig();

      expect(result).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalledWith('/home/testuser/.n8ncli.json');
    });
  });

  describe('maskApiKey', () => {
    it('masks long API keys showing first 8 and last 4 characters', () => {
      const masked = maskApiKey('abcdefghijklmnopqrstuvwxyz');
      expect(masked).toBe('abcdefgh...wxyz');
    });

    it('returns *** for short API keys', () => {
      const masked = maskApiKey('short');
      expect(masked).toBe('***');
    });

    it('returns *** for exactly 12 character keys', () => {
      const masked = maskApiKey('123456789012');
      expect(masked).toBe('***');
    });

    it('masks 13 character key properly', () => {
      const masked = maskApiKey('1234567890123');
      expect(masked).toBe('12345678...0123');
    });
  });

  describe('validateHost', () => {
    it('accepts valid HTTPS URL', () => {
      const result = validateHost('https://n8n.example.com/api/v1');
      expect(result).toEqual({ valid: true });
    });

    it('accepts valid HTTP URL', () => {
      const result = validateHost('http://localhost:5678/api/v1');
      expect(result).toEqual({ valid: true });
    });

    it('rejects invalid URL', () => {
      const result = validateHost('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });

    it('rejects empty string', () => {
      const result = validateHost('');
      expect(result.valid).toBe(false);
    });

    it('rejects URL without protocol', () => {
      const result = validateHost('example.com/api/v1');
      expect(result.valid).toBe(false);
    });
  });

  describe('normalizeKey', () => {
    it('normalizes "host" to host', () => {
      const result = normalizeKey('host');
      expect(result).toEqual({ key: 'host', valid: true });
    });

    it('normalizes "HOST" (uppercase) to host', () => {
      const result = normalizeKey('HOST');
      expect(result).toEqual({ key: 'host', valid: true });
    });

    it('normalizes "n8nhost" alias to host', () => {
      const result = normalizeKey('n8nhost');
      expect(result).toEqual({ key: 'host', valid: true });
    });

    it('normalizes "apikey" to apiKey', () => {
      const result = normalizeKey('apikey');
      expect(result).toEqual({ key: 'apiKey', valid: true });
    });

    it('normalizes "APIKEY" (uppercase) to apiKey', () => {
      const result = normalizeKey('APIKEY');
      expect(result).toEqual({ key: 'apiKey', valid: true });
    });

    it('normalizes "n8nkey" alias to apiKey', () => {
      const result = normalizeKey('n8nkey');
      expect(result).toEqual({ key: 'apiKey', valid: true });
    });

    it('rejects unknown keys', () => {
      const result = normalizeKey('unknown');
      expect(result.valid).toBe(false);
      expect(result).toHaveProperty('error');
      if (!result.valid) {
        expect(result.error).toContain('Unknown config key');
        expect(result.error).toContain('unknown');
      }
    });
  });
});
