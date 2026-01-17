# n8ncli

A TypeScript CLI tool for interacting with the n8n API to manage workflows.

## Installation

```bash
npm install
npm run build
```

To install globally:

```bash
npm link
```

## Configuration

The CLI requires two environment variables:

| Variable | Description |
|----------|-------------|
| `N8N_HOST` | n8n instance URL including `/api/v1` suffix |
| `N8N_API_KEY` | API key from n8n Settings > API |

Create a `.env` file:

```bash
N8N_HOST=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your-api-key-here
```

Or pass them as CLI flags:

```bash
n8ncli --host https://your-n8n-instance.com/api/v1 --api-key your-key workflows list
```

## Usage

### Test Connection

```bash
n8ncli test
```

### List Workflows

```bash
# List all workflows
n8ncli workflows list

# List only active workflows
n8ncli workflows list --active

# List only inactive workflows
n8ncli workflows list --inactive

# Filter by tags
n8ncli workflows list --tags "production,critical"

# Limit results
n8ncli workflows list --limit 10

# Output as JSON
n8ncli workflows list --json

# Different output formats: table, json, minimal
n8ncli workflows list --format minimal
```

### Get Workflow Details

```bash
# Get a specific workflow by ID
n8ncli workflows get <workflow-id>

# Output as JSON
n8ncli workflows get <workflow-id> --json
```

### Show Configuration

```bash
n8ncli config
```

## Global Options

| Option | Description |
|--------|-------------|
| `--host <url>` | n8n instance URL (overrides N8N_HOST) |
| `--api-key <key>` | API key (overrides N8N_API_KEY) |
| `-v, --verbose` | Enable verbose output |
| `-q, --quiet` | Suppress non-essential output |
| `--version` | Show version number |
| `--help` | Show help |

## Development

```bash
# Build the project
npm run build

# Watch mode
npm run dev

# Run CLI with .env loaded
npm run cli

# Build and run in one step
npm run cli:dev
```

## Requirements

- Node.js >= 18.0.0

## License

MIT
