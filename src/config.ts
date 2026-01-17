export interface N8nConfig {
  host: string;
  apiKey: string;
}

export function loadConfig(): N8nConfig {
  const host = process.env.N8N_HOST;
  const apiKey = process.env.N8N_API_KEY;

  if (!host) {
    throw new Error('N8N_HOST environment variable is required');
  }

  if (!apiKey) {
    throw new Error('N8N_API_KEY environment variable is required');
  }

  return { host, apiKey };
}
