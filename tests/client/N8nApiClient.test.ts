import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { N8nApiClient } from '../../src/client/index.js';
import type { N8nWorkflow, ListWorkflowsResponse } from '../../src/client/types.js';

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
});
