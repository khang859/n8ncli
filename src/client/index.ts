import {
  N8nApiError,
  N8nAuthenticationError,
  N8nConnectionError,
} from '../errors/index.js';
import type {
  N8nApiClientOptions,
  N8nWorkflow,
  ListWorkflowsOptions,
  ListWorkflowsResponse,
  TestConnectionResult,
} from './types.js';

export class N8nApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options: N8nApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'X-N8N-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      throw new N8nConnectionError(
        `Failed to connect to n8n at ${this.baseUrl}`,
        error instanceof Error ? error : undefined
      );
    }

    if (response.status === 401) {
      throw new N8nAuthenticationError();
    }

    if (response.status === 204) {
      return undefined as T;
    }

    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch {
      if (!response.ok) {
        throw new N8nApiError(
          `Request failed with status ${response.status}`,
          response.status
        );
      }
      return undefined as T;
    }

    if (!response.ok) {
      const message =
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData
          ? String((responseData as { message: unknown }).message)
          : `Request failed with status ${response.status}`;
      throw new N8nApiError(message, response.status, responseData);
    }

    return responseData as T;
  }

  async listWorkflows(options?: ListWorkflowsOptions): Promise<N8nWorkflow[]> {
    const params = new URLSearchParams();

    if (options?.cursor) {
      params.set('cursor', options.cursor);
    }
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit));
    }
    if (options?.active !== undefined) {
      params.set('active', String(options.active));
    }
    if (options?.tags) {
      params.set('tags', options.tags);
    }

    const queryString = params.toString();
    const endpoint = `/workflows${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<ListWorkflowsResponse>('GET', endpoint);
    return response.data;
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>('GET', `/workflows/${id}`);
  }

  async testConnection(): Promise<TestConnectionResult> {
    try {
      const workflows = await this.listWorkflows({ limit: 1 });
      return {
        success: true,
        workflowCount: workflows.length,
        message: 'Successfully connected to n8n API',
      };
    } catch (error) {
      if (error instanceof N8nAuthenticationError) {
        return {
          success: false,
          workflowCount: 0,
          message: 'Authentication failed. Check your API key.',
        };
      }
      if (error instanceof N8nConnectionError) {
        return {
          success: false,
          workflowCount: 0,
          message: `Connection failed: ${error.message}`,
        };
      }
      return {
        success: false,
        workflowCount: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export * from './types.js';
