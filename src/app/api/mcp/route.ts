import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { inbox } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

/**
 * MCP-compatible HTTP endpoint for AI Digital Streams.
 * Implements a simplified JSON-RPC interface that the Cowork MCP plugin
 * can call to manage inbox jobs, research entries, and run queries.
 *
 * Auth: Bearer token matching ADMIN_PASSWORD.
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function jsonRpcOk(id: string | number | null, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id, result });
}

function jsonRpcError(id: string | number | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } });
}

// ---------- Tool definitions ----------

const TOOLS = [
  {
    name: 'insert_inbox_job',
    description: 'Add a new job to the AIDS admin inbox queue.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Job title' },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'], description: 'Job priority' },
        category: { type: 'string', description: 'Job category (seo, content, research, affiliate, design, operations, other)' },
        instructions: { type: 'string', description: 'Full instructions for the job' },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_inbox_jobs',
    description: 'List jobs in the inbox, optionally filtered by status.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status: queued, execute-requested, in-progress, done, failed. Omit for all.' },
        limit: { type: 'number', description: 'Max rows to return (default 50)' },
      },
    },
  },
  {
    name: 'update_inbox_job',
    description: 'Update an inbox job status or notes.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Job ID' },
        status: { type: 'string', description: 'New status' },
        result_notes: { type: 'string', description: 'Result notes' },
      },
      required: ['id'],
    },
  },
  // TODO: insert_research_tool — re-add once a tool-discovery table exists.
  // Our schema currently exposes research_notes (kind/title/body/source/status),
  // not the name/category/website/priority shape the Cowork side expects.
  {
    name: 'run_query',
    description: 'Run a read-only SQL query against the AIDS database. SELECT only.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL SELECT query to run' },
      },
      required: ['query'],
    },
  },
];

// ---------- Tool handlers ----------

async function handleToolCall(name: string, args: Record<string, unknown>) {
  const db = getDb();

  switch (name) {
    case 'insert_inbox_job': {
      const result = await db.insert(inbox).values({
        title: String(args.title ?? 'Untitled'),
        priority: String(args.priority ?? 'medium'),
        category: args.category ? String(args.category) : null,
        instructions: args.instructions ? String(args.instructions) : '',
        status: 'queued',
        executionOrder: 0,
      }).returning({ id: inbox.id, title: inbox.title });
      return { content: [{ type: 'text', text: `Job created: #${result[0].id} "${result[0].title}"` }] };
    }

    case 'list_inbox_jobs': {
      const limit = Number(args.limit) || 50;
      const rows = args.status
        ? await db.select().from(inbox).where(eq(inbox.status, String(args.status))).orderBy(desc(inbox.id)).limit(limit)
        : await db.select().from(inbox).orderBy(desc(inbox.id)).limit(limit);
      const text = rows.map(r =>
        `#${r.id} [${r.status}] (${r.priority}) ${r.title}`
      ).join('\n') || 'No jobs found.';
      return { content: [{ type: 'text', text }] };
    }

    case 'update_inbox_job': {
      const id = Number(args.id);
      const updates: Record<string, unknown> = {};
      if (args.status) updates.status = String(args.status);
      if (args.result_notes) updates.resultNotes = String(args.result_notes);
      if (args.status === 'done' || args.status === 'completed') {
        updates.completedDate = new Date().toISOString();
      }
      await db.update(inbox).set(updates).where(eq(inbox.id, id));
      return { content: [{ type: 'text', text: `Job #${id} updated.` }] };
    }

    case 'run_query': {
      const q = String(args.query ?? '').trim();
      if (!q.toLowerCase().startsWith('select')) {
        return { content: [{ type: 'text', text: 'Error: Only SELECT queries are allowed.' }], isError: true };
      }
      try {
        const result = await db.execute(sql.raw(q));
        const rows = Array.isArray(result) ? result : (result as any).rows ?? [];
        return { content: [{ type: 'text', text: JSON.stringify(rows.slice(0, 100), null, 2) }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Query error: ${err.message}` }], isError: true };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ---------- Route handler ----------

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!ADMIN_PASSWORD || token !== ADMIN_PASSWORD) {
    return unauthorized();
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, 'Parse error');
  }

  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== '2.0') {
    return jsonRpcError(id, -32600, 'Invalid JSON-RPC version');
  }

  switch (method) {
    case 'initialize':
      return jsonRpcOk(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'aids-neon', version: '0.1.0' },
      });

    case 'tools/list':
      return jsonRpcOk(id, { tools: TOOLS });

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments ?? {};
      try {
        const result = await handleToolCall(toolName, toolArgs);
        return jsonRpcOk(id, result);
      } catch (err: any) {
        return jsonRpcError(id, -32000, err.message);
      }
    }

    default:
      return jsonRpcError(id, -32601, `Method not found: ${method}`);
  }
}
