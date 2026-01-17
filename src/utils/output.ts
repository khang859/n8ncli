import chalk from 'chalk';
import type { N8nWorkflow } from '../client/types.js';
import { noColor } from './env.js';

export type OutputFormat = 'json' | 'table' | 'minimal' | 'detail';

// Conditionally apply colors based on NO_COLOR
const bold = noColor ? (s: string) => s : chalk.bold;
const green = noColor ? (s: string) => s : chalk.green;
const gray = noColor ? (s: string) => s : chalk.gray;
const yellow = noColor ? (s: string) => s : chalk.yellow;

export function formatOutput(
  data: unknown,
  format: OutputFormat,
  type: string
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'table':
      return formatTable(data, type);
    case 'minimal':
      return formatMinimal(data, type);
    case 'detail':
      return formatDetail(data, type);
    default:
      return JSON.stringify(data, null, 2);
  }
}

function formatTable(data: unknown, type: string): string {
  if (type === 'workflows' && Array.isArray(data)) {
    const workflows = data as N8nWorkflow[];
    if (workflows.length === 0) {
      return yellow('No workflows found.');
    }

    const header = `${bold('ID'.padEnd(26))} ${bold('Name'.padEnd(35))} ${bold('Status'.padEnd(10))} ${bold('Updated')}`;
    const separator = '─'.repeat(85);
    const rows = workflows.map((w) => {
      const status = w.active ? green('active') : gray('inactive');
      const updated = new Date(w.updatedAt).toLocaleDateString();
      // Account for ANSI codes in padding
      const statusPadding = w.active ? 19 : 19;
      return `${w.id.padEnd(26)} ${w.name.slice(0, 33).padEnd(35)} ${status.padEnd(statusPadding)} ${updated}`;
    });

    return [header, separator, ...rows].join('\n');
  }
  return JSON.stringify(data, null, 2);
}

function formatMinimal(data: unknown, type: string): string {
  if (type === 'workflows' && Array.isArray(data)) {
    return (data as N8nWorkflow[]).map((w) => w.id).join('\n');
  }
  return String(data);
}

function formatDetail(data: unknown, type: string): string {
  if (type === 'workflow') {
    const w = data as N8nWorkflow;
    return [
      bold('Workflow Details'),
      '─'.repeat(40),
      `${gray('ID:')}          ${w.id}`,
      `${gray('Name:')}        ${w.name}`,
      `${gray('Status:')}      ${w.active ? green('active') : gray('inactive')}`,
      `${gray('Created:')}     ${new Date(w.createdAt).toLocaleString()}`,
      `${gray('Updated:')}     ${new Date(w.updatedAt).toLocaleString()}`,
      `${gray('Nodes:')}       ${w.nodes?.length ?? 0}`,
      w.tags?.length ? `${gray('Tags:')}        ${w.tags.map((t) => t.name).join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
  return JSON.stringify(data, null, 2);
}
