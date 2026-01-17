import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfig, loadConfigWithSources } from './config.js';
import * as configStore from './utils/configStore.js';

// Mock the configStore module
vi.mock('./utils/configStore.js', () => ({
  loadPersistedConfig: vi.fn(),
}));

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env.N8N_HOST;
    delete process.env.N8N_API_KEY;
    // Default: no persisted config
    vi.mocked(configStore.loadPersistedConfig).mockReturnValue({});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('loadConfigWithSources', () => {
    describe('priority: CLI > env > file', () => {
      it('uses CLI options when all sources are available', () => {
        process.env.N8N_HOST = 'https://env-host.com';
        process.env.N8N_API_KEY = 'env-key';
        vi.mocked(configStore.loadPersistedConfig).mockReturnValue({
          host: 'https://file-host.com',
          apiKey: 'file-key',
        });

        const config = loadConfigWithSources({
          host: 'https://cli-host.com',
          apiKey: 'cli-key',
        });

        expect(config.host).toBe('https://cli-host.com');
        expect(config.apiKey).toBe('cli-key');
        expect(config.hostSource).toBe('cli');
        expect(config.apiKeySource).toBe('cli');
      });

      it('uses env vars when CLI options are not provided', () => {
        process.env.N8N_HOST = 'https://env-host.com';
        process.env.N8N_API_KEY = 'env-key';
        vi.mocked(configStore.loadPersistedConfig).mockReturnValue({
          host: 'https://file-host.com',
          apiKey: 'file-key',
        });

        const config = loadConfigWithSources();

        expect(config.host).toBe('https://env-host.com');
        expect(config.apiKey).toBe('env-key');
        expect(config.hostSource).toBe('env');
        expect(config.apiKeySource).toBe('env');
      });

      it('uses file config when CLI and env are not available', () => {
        vi.mocked(configStore.loadPersistedConfig).mockReturnValue({
          host: 'https://file-host.com',
          apiKey: 'file-key',
        });

        const config = loadConfigWithSources();

        expect(config.host).toBe('https://file-host.com');
        expect(config.apiKey).toBe('file-key');
        expect(config.hostSource).toBe('file');
        expect(config.apiKeySource).toBe('file');
      });

      it('can mix sources (CLI host, env apiKey)', () => {
        process.env.N8N_API_KEY = 'env-key';
        vi.mocked(configStore.loadPersistedConfig).mockReturnValue({
          host: 'https://file-host.com',
        });

        const config = loadConfigWithSources({
          host: 'https://cli-host.com',
        });

        expect(config.host).toBe('https://cli-host.com');
        expect(config.hostSource).toBe('cli');
        expect(config.apiKey).toBe('env-key');
        expect(config.apiKeySource).toBe('env');
      });

      it('can mix sources (env host, file apiKey)', () => {
        process.env.N8N_HOST = 'https://env-host.com';
        vi.mocked(configStore.loadPersistedConfig).mockReturnValue({
          apiKey: 'file-key',
        });

        const config = loadConfigWithSources();

        expect(config.host).toBe('https://env-host.com');
        expect(config.hostSource).toBe('env');
        expect(config.apiKey).toBe('file-key');
        expect(config.apiKeySource).toBe('file');
      });
    });

    describe('missing values', () => {
      it('returns empty string and missing source when no config available', () => {
        const config = loadConfigWithSources();

        expect(config.host).toBe('');
        expect(config.apiKey).toBe('');
        expect(config.hostSource).toBe('missing');
        expect(config.apiKeySource).toBe('missing');
      });

      it('handles partial config (only host)', () => {
        process.env.N8N_HOST = 'https://env-host.com';

        const config = loadConfigWithSources();

        expect(config.host).toBe('https://env-host.com');
        expect(config.hostSource).toBe('env');
        expect(config.apiKey).toBe('');
        expect(config.apiKeySource).toBe('missing');
      });

      it('handles partial config (only apiKey)', () => {
        vi.mocked(configStore.loadPersistedConfig).mockReturnValue({
          apiKey: 'file-key',
        });

        const config = loadConfigWithSources();

        expect(config.host).toBe('');
        expect(config.hostSource).toBe('missing');
        expect(config.apiKey).toBe('file-key');
        expect(config.apiKeySource).toBe('file');
      });
    });

    describe('empty values', () => {
      it('treats empty CLI options as not provided', () => {
        process.env.N8N_HOST = 'https://env-host.com';

        const config = loadConfigWithSources({
          host: '', // Empty string
          apiKey: undefined,
        });

        expect(config.host).toBe('https://env-host.com');
        expect(config.hostSource).toBe('env');
      });
    });
  });

  describe('loadConfig', () => {
    it('returns config when all values are present', () => {
      process.env.N8N_HOST = 'https://env-host.com';
      process.env.N8N_API_KEY = 'env-key';

      const config = loadConfig();

      expect(config).toEqual({
        host: 'https://env-host.com',
        apiKey: 'env-key',
      });
    });

    it('throws error when host is missing', () => {
      process.env.N8N_API_KEY = 'env-key';

      expect(() => loadConfig()).toThrow('N8N_HOST is required');
    });

    it('throws error when apiKey is missing', () => {
      process.env.N8N_HOST = 'https://env-host.com';

      expect(() => loadConfig()).toThrow('N8N_API_KEY is required');
    });

    it('throws error when both are missing', () => {
      expect(() => loadConfig()).toThrow('N8N_HOST is required');
    });

    it('passes CLI options through to loadConfigWithSources', () => {
      const config = loadConfig({
        host: 'https://cli-host.com',
        apiKey: 'cli-key',
      });

      expect(config).toEqual({
        host: 'https://cli-host.com',
        apiKey: 'cli-key',
      });
    });

    it('merges CLI options with env vars', () => {
      process.env.N8N_API_KEY = 'env-key';

      const config = loadConfig({
        host: 'https://cli-host.com',
      });

      expect(config).toEqual({
        host: 'https://cli-host.com',
        apiKey: 'env-key',
      });
    });
  });
});
