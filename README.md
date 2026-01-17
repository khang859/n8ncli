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

The CLI requires two configuration values:

| Setting | Description |
|---------|-------------|
| `host` | n8n instance URL including `/api/v1` suffix |
| `apiKey` | API key from n8n Settings > API |

### Configuration Priority

Configuration is loaded in the following order (highest priority first):

1. **CLI flags** (`--host`, `--api-key`)
2. **Environment variables** (`N8N_HOST`, `N8N_API_KEY`)
3. **Config file** (`~/.n8ncli.json`)

### Setting Configuration (Recommended)

Use the built-in config commands to persist your credentials:

```bash
# Set your n8n host
n8ncli config set host https://your-n8n-instance.com/api/v1

# Set your API key
n8ncli config set apikey your-api-key-here

# Verify your configuration
n8ncli config show
```

The config file is stored at `~/.n8ncli.json` with secure permissions (0600 - owner read/write only).

### Alternative: Environment Variables

Create a `.env` file in your project directory:

```bash
N8N_HOST=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your-api-key-here
```

### Alternative: CLI Flags

Pass configuration directly on the command line:

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

### Manage Configuration

```bash
# Show current configuration and sources
n8ncli config show

# Set a configuration value
n8ncli config set host https://your-n8n-instance.com/api/v1
n8ncli config set apikey your-api-key

# Show config file location
n8ncli config path

# Clear persisted configuration
n8ncli config clear
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
