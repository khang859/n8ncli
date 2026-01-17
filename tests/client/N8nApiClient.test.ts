import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { N8nApiClient } from '../../src/client/index.js';
import type { N8nWorkflow, ListWorkflowsResponse } from '../../src/client/types.js';
import {
  N8nApiError,
  N8nAuthenticationError,
  N8nConnectionError,
} from '../../src/errors/index.js';

// Helper to create a mock Response object
function createMockResponse(data: unknown, options: { status?: number; ok?: boolean } = {}): Response {
  const { status = 200, ok = true } = options;
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
    bytes: vi.fn(),
  } as unknown as Response;
}

// Sample workflow data for tests
const mockWorkflow: N8nWorkflow = {
  id: 'wf-123',
  name: 'Test Workflow',
  active: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  nodes: [],
  connections: {},
  settings: {},
  tags: [],
};

const mockWorkflow2: N8nWorkflow = {
  id: 'wf-456',
  name: 'Another Workflow',
  active: false,
  createdAt: '2024-01-03T00:00:00.000Z',
  updatedAt: '2024-01-04T00:00:00.000Z',
};

describe('N8nApiClient', () => {
  const baseUrl = 'https://n8n.example.com/api/v1';
  const apiKey = 'test-api-key';
  let client: N8nApiClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    client = new N8nApiClient({ baseUrl, apiKey });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('listWorkflows', () => {
    it('returns array of workflows from response.data', async () => {
      const response: ListWorkflowsResponse = {
        data: [mockWorkflow, mockWorkflow2],
      };
      mockFetch.mockResolvedValue(createMockResponse(response));

      const result = await client.listWorkflows();

      expect(result).toEqual([mockWorkflow, mockWorkflow2]);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
          }),
        })
      );
    });

    it('handles cursor query parameter', async () => {
      const response: ListWorkflowsResponse = { data: [] };
      mockFetch.mockResolvedValue(createMockResponse(response));

      await client.listWorkflows({ cursor: 'abc123' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows?cursor=abc123`,
        expect.any(Object)
      );
    });

    it('handles limit query parameter', async () => {
      const response: ListWorkflowsResponse = { data: [] };
      mockFetch.mockResolvedValue(createMockResponse(response));

      await client.listWorkflows({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows?limit=10`,
        expect.any(Object)
      );
    });

    it('handles active query parameter', async () => {
      const response: ListWorkflowsResponse = { data: [] };
      mockFetch.mockResolvedValue(createMockResponse(response));

      await client.listWorkflows({ active: true });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows?active=true`,
        expect.any(Object)
      );
    });

    it('handles tags query parameter', async () => {
      const response: ListWorkflowsResponse = { data: [] };
      mockFetch.mockResolvedValue(createMockResponse(response));

      await client.listWorkflows({ tags: 'production,critical' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows?tags=production%2Ccritical`,
        expect.any(Object)
      );
    });

    it('handles multiple query parameters', async () => {
      const response: ListWorkflowsResponse = { data: [] };
      mockFetch.mockResolvedValue(createMockResponse(response));

      await client.listWorkflows({ cursor: 'xyz', limit: 5, active: false });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('cursor=xyz');
      expect(calledUrl).toContain('limit=5');
      expect(calledUrl).toContain('active=false');
    });
  });

  describe('getWorkflow', () => {
    it('returns workflow object for given id', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockWorkflow));

      const result = await client.getWorkflow('wf-123');

      expect(result).toEqual(mockWorkflow);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/wf-123`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
          }),
        })
      );
    });
  });

  describe('createWorkflow', () => {
    it('sends POST with body and returns created workflow', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockWorkflow));

      const createData = {
        name: 'Test Workflow',
        nodes: [],
        connections: {},
      };

      const result = await client.createWorkflow(createData);

      expect(result).toEqual(mockWorkflow);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(createData),
        })
      );
    });
  });

  describe('updateWorkflow', () => {
    it('sends PUT with body and returns updated workflow', async () => {
      const updatedWorkflow = { ...mockWorkflow, name: 'Updated Workflow' };
      mockFetch.mockResolvedValue(createMockResponse(updatedWorkflow));

      const updateData = { name: 'Updated Workflow' };

      const result = await client.updateWorkflow('wf-123', updateData);

      expect(result).toEqual(updatedWorkflow);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/wf-123`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('deleteWorkflow', () => {
    it('sends DELETE request and returns void', async () => {
      mockFetch.mockResolvedValue(createMockResponse(undefined, { status: 204 }));

      const result = await client.deleteWorkflow('wf-123');

      expect(result).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/wf-123`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
          }),
        })
      );
    });
  });

  describe('activateWorkflow', () => {
    it('sends POST to /activate and returns workflow', async () => {
      const activatedWorkflow = { ...mockWorkflow, active: true };
      mockFetch.mockResolvedValue(createMockResponse(activatedWorkflow));

      const result = await client.activateWorkflow('wf-123');

      expect(result).toEqual(activatedWorkflow);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/wf-123/activate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
          }),
        })
      );
    });
  });

  describe('deactivateWorkflow', () => {
    it('sends POST to /deactivate and returns workflow', async () => {
      const deactivatedWorkflow = { ...mockWorkflow, active: false };
      mockFetch.mockResolvedValue(createMockResponse(deactivatedWorkflow));

      const result = await client.deactivateWorkflow('wf-123');

      expect(result).toEqual(deactivatedWorkflow);
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows/wf-123/deactivate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
          }),
        })
      );
    });
  });

  describe('testConnection', () => {
    it('returns success result with workflowCount', async () => {
      const response: ListWorkflowsResponse = {
        data: [mockWorkflow],
      };
      mockFetch.mockResolvedValue(createMockResponse(response));

      const result = await client.testConnection();

      expect(result).toEqual({
        success: true,
        workflowCount: 1,
        message: 'Successfully connected to n8n API',
      });
    });

    it('calls listWorkflows with limit 1', async () => {
      const response: ListWorkflowsResponse = { data: [] };
      mockFetch.mockResolvedValue(createMockResponse(response));

      await client.testConnection();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/workflows?limit=1`,
        expect.any(Object)
      );
    });
  });

  describe('constructor', () => {
    it('removes trailing slash from baseUrl', async () => {
      const clientWithSlash = new N8nApiClient({
        baseUrl: 'https://n8n.example.com/api/v1/',
        apiKey,
      });
      const response: ListWorkflowsResponse = { data: [] };
      mockFetch.mockResolvedValue(createMockResponse(response));

      await clientWithSlash.listWorkflows();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://n8n.example.com/api/v1/workflows',
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    describe('N8nConnectionError', () => {
      it('throws N8nConnectionError when fetch throws TypeError (network error)', async () => {
        const networkError = new TypeError('Failed to fetch');
        mockFetch.mockRejectedValue(networkError);

        await expect(client.listWorkflows()).rejects.toThrow(N8nConnectionError);
        await expect(client.listWorkflows()).rejects.toThrow(
          `Failed to connect to n8n at ${baseUrl}`
        );
      });

      it('throws N8nConnectionError when fetch rejects with any error', async () => {
        const genericError = new Error('ECONNREFUSED');
        mockFetch.mockRejectedValue(genericError);

        await expect(client.getWorkflow('wf-123')).rejects.toThrow(N8nConnectionError);
      });

      it('wraps original error as cause in N8nConnectionError', async () => {
        const originalError = new Error('Connection refused');
        mockFetch.mockRejectedValue(originalError);

        try {
          await client.listWorkflows();
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(N8nConnectionError);
          expect((error as N8nConnectionError).cause).toBe(originalError);
        }
      });
    });

    describe('N8nAuthenticationError', () => {
      it('throws N8nAuthenticationError on 401 response', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
        );

        await expect(client.listWorkflows()).rejects.toThrow(N8nAuthenticationError);
      });

      it('throws N8nAuthenticationError with default message', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({}, { status: 401, ok: false })
        );

        await expect(client.listWorkflows()).rejects.toThrow(
          'Authentication failed. Check your API key.'
        );
      });
    });

    describe('N8nApiError', () => {
      it('throws N8nApiError on 400 response', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Bad request' }, { status: 400, ok: false })
        );

        await expect(client.createWorkflow({ name: '' })).rejects.toThrow(N8nApiError);
      });

      it('throws N8nApiError on 404 response', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Workflow not found' }, { status: 404, ok: false })
        );

        await expect(client.getWorkflow('non-existent')).rejects.toThrow(N8nApiError);
      });

      it('throws N8nApiError on 500 response', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Internal server error' }, { status: 500, ok: false })
        );

        await expect(client.listWorkflows()).rejects.toThrow(N8nApiError);
      });

      it('includes status code in N8nApiError', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Not found' }, { status: 404, ok: false })
        );

        try {
          await client.getWorkflow('wf-404');
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(N8nApiError);
          expect((error as N8nApiError).statusCode).toBe(404);
        }
      });

      it('includes message from response in error', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Workflow not found' }, { status: 404, ok: false })
        );

        await expect(client.getWorkflow('wf-404')).rejects.toThrow('Workflow not found');
      });

      it('uses generic message when response has no message field', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ error: 'something went wrong' }, { status: 500, ok: false })
        );

        await expect(client.listWorkflows()).rejects.toThrow(
          'Request failed with status 500'
        );
      });

      it('handles non-JSON error response gracefully', async () => {
        const response = {
          ok: false,
          status: 502,
          json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
          headers: new Headers(),
          redirected: false,
          statusText: 'Bad Gateway',
          type: 'basic',
          url: '',
          clone: vi.fn(),
          body: null,
          bodyUsed: false,
          arrayBuffer: vi.fn(),
          blob: vi.fn(),
          formData: vi.fn(),
          text: vi.fn(),
          bytes: vi.fn(),
        } as unknown as Response;
        mockFetch.mockResolvedValue(response);

        await expect(client.listWorkflows()).rejects.toThrow(N8nApiError);
        await expect(client.listWorkflows()).rejects.toThrow(
          'Request failed with status 502'
        );
      });
    });

    describe('testConnection error handling', () => {
      it('returns failure result on N8nAuthenticationError', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({}, { status: 401, ok: false })
        );

        const result = await client.testConnection();

        expect(result).toEqual({
          success: false,
          workflowCount: 0,
          message: 'Authentication failed. Check your API key.',
        });
      });

      it('returns failure result on N8nConnectionError', async () => {
        mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

        const result = await client.testConnection();

        expect(result).toEqual({
          success: false,
          workflowCount: 0,
          message: `Connection failed: Failed to connect to n8n at ${baseUrl}`,
        });
      });

      it('returns failure result with error message on other errors', async () => {
        // N8nApiError (e.g., 500 error)
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Server error' }, { status: 500, ok: false })
        );

        const result = await client.testConnection();

        expect(result).toEqual({
          success: false,
          workflowCount: 0,
          message: 'Server error',
        });
      });
    });
  });
});
