# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**n8n REST API (Primary Integration):**
- Purpose: Manage n8n workflows programmatically
- SDK/Client: Custom `N8nApiClient` class in `src/client/index.ts`
- Auth: API key via `X-N8N-API-KEY` header
- Base URL: Configured via `N8N_HOST` environment variable

**n8n API Endpoints Used:**
- `GET /workflows` - List all workflows with pagination
- `GET /workflows/{id}` - Get specific workflow by ID

**API Response Types:**
- `N8nWorkflow` - Workflow object with nodes, connections, settings
- `ListWorkflowsResponse` - Paginated list with `data` array and `nextCursor`
- `TestConnectionResult` - Connection test result with success/failure

## Data Storage

**Databases:**
- None - CLI is stateless, no local database

**File Storage:**
- Persisted config: `~/.n8ncli.json`
- Location: User home directory via `os.homedir()`
- Client: Node.js `fs` module in `src/utils/configStore.ts`
- Security: File permissions set to 0600 (owner read/write only)

**Caching:**
- None - Each command execution fetches fresh data from API

## Authentication & Identity

**Auth Method:**
- API key authentication to n8n instance
- Key passed via `X-N8N-API-KEY` HTTP header
- Key stored in environment variable, CLI flag, or persisted config

**Config Sources (priority order):**
1. CLI flag: `--api-key <key>`
2. Environment variable: `N8N_API_KEY`
3. Persisted file: `~/.n8ncli.json`

**Security Practices:**
- API key masked in display output: `n8na***...***xyz`
- Config file with restricted permissions (0600)
- Warning printed if file permissions too open

## Monitoring & Observability

**Error Tracking:**
- None - Errors printed to stderr and CLI exits

**Logging:**
- Debug output via `--verbose` flag
- Quiet mode via `--quiet` flag
- No external logging service

**Analytics:**
- None

## CI/CD & Deployment

**Hosting:**
- Not applicable - CLI tool installed locally

**Distribution:**
- npm package (not published yet)
- Local installation via `npm link`

**CI Pipeline:**
- Not configured yet

## Environment Configuration

**Development:**
- Required env vars: `N8N_HOST`, `N8N_API_KEY`
- Secrets location: `.env` file (gitignored)
- Template: `.env.example` provides format

**.env.example Format:**
```bash
N8N_HOST=https://your-instance.app.n8n.cloud/api/v1
N8N_API_KEY=your-api-key-here
```

**Configuration Priority:**
1. CLI flags (`--host`, `--api-key`) - highest priority
2. Environment variables (`N8N_HOST`, `N8N_API_KEY`)
3. Persisted config file (`~/.n8ncli.json`) - lowest priority

## HTTP Client Details

**Implementation:**
- Node.js native `fetch()` API - `src/client/index.ts`
- No external HTTP library (axios, node-fetch)

**Request Pattern:**
```typescript
const response = await fetch(url, {
  method,
  headers: {
    'X-N8N-API-KEY': this.apiKey,
    'Content-Type': 'application/json',
  },
  body: data ? JSON.stringify(data) : undefined,
});
```

**Error Handling:**
- 401 → `N8nAuthenticationError`
- Network failure → `N8nConnectionError`
- Other HTTP errors → `N8nApiError` with status code

## Webhooks & Callbacks

**Incoming:**
- None - CLI is client-only

**Outgoing:**
- None - CLI only reads from n8n API

---

*Integration audit: 2026-01-17*
*Update when adding/removing external services*
