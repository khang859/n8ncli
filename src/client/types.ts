export interface N8nApiClientOptions {
  baseUrl: string;
  apiKey: string;
}

export interface N8nWorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: Record<string, unknown>;
}

export interface N8nWorkflowConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes?: N8nWorkflowNode[];
  connections?: Record<string, Record<string, N8nWorkflowConnection[][]>>;
  settings?: Record<string, unknown>;
  tags?: Array<{ id: string; name: string }>;
}

export interface ListWorkflowsOptions {
  cursor?: string;
  limit?: number;
  active?: boolean;
  tags?: string;
}

export interface ListWorkflowsResponse {
  data: N8nWorkflow[];
  nextCursor?: string;
}

export interface TestConnectionResult {
  success: boolean;
  workflowCount: number;
  message?: string;
}

export interface WorkflowCreateInput {
  name: string;
  nodes?: N8nWorkflowNode[];
  connections?: Record<string, Record<string, N8nWorkflowConnection[][]>>;
  settings?: Record<string, unknown>;
  tags?: Array<{ id: string; name: string }>;
}

export interface WorkflowUpdateInput {
  name?: string;
  nodes?: N8nWorkflowNode[];
  connections?: Record<string, Record<string, N8nWorkflowConnection[][]>>;
  settings?: Record<string, unknown>;
  tags?: Array<{ id: string; name: string }>;
}
