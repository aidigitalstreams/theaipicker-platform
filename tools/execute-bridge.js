#!/usr/bin/env node
/**
 * Desktop bridge for the Inbox API.
 *
 *   1. Pings GET /api/inbox/heartbeat every 60s so /admin/inbox shows online.
 *   2. Polls GET /api/inbox/execute every 30s.
 *   3. For each returned job: PUT status=in-progress → write tasks.md →
 *      run `claude -p "..."` in the project dir → PUT status=done|failed
 *      with the captured output truncated into result_notes.
 *
 * Config: tools/.env (ADMIN_URL, ADMIN_PASSWORD, PROJECT_DIR, optional
 * MACHINE_NAME / POLL_INTERVAL_MS / HEARTBEAT_INTERVAL_MS / MAX_JOB_MS).
 *
 * Logs: tools/bridge.log (also mirrored to stdout).
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, '.env');
const LOG_PATH = path.join(__dirname, 'bridge.log');

// ---------- Env loader ----------
if (fs.existsSync(ENV_PATH)) {
  for (const raw of fs.readFileSync(ENV_PATH, 'utf-8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2];
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = value;
  }
}

const CONFIG = {
  ADMIN_URL: (process.env.ADMIN_URL ?? '').replace(/\/$/, ''),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? '',
  PROJECT_DIR: process.env.PROJECT_DIR ?? '',
  MACHINE_NAME: (process.env.MACHINE_NAME ?? os.hostname()).replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 80),
  POLL_INTERVAL_MS: Number(process.env.POLL_INTERVAL_MS) || 30_000,
  HEARTBEAT_INTERVAL_MS: Number(process.env.HEARTBEAT_INTERVAL_MS) || 60_000,
  MAX_JOB_MS: Number(process.env.MAX_JOB_MS) || 60 * 60 * 1000, // 60 min
  CLAUDE_PROMPT: process.env.CLAUDE_PROMPT
    ?? 'STOP. Your ONLY job is to open and read the file called tasks.md in the current directory, then do exactly what it says. Do not ask questions. Do not wait for input. Read tasks.md NOW and execute the instructions inside it. Commit and push when done.',
};

// ---------- Logger ----------
function log(level, msg) {
  const line = `[${new Date().toISOString()}] ${level.padEnd(5)} ${msg}`;
  // eslint-disable-next-line no-console
  console.log(line);
  try {
    fs.appendFileSync(LOG_PATH, line + '\n');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('log write failed:', err.message);
  }
}

// ---------- Validate config ----------
function validateConfig() {
  const missing = [];
  if (!CONFIG.ADMIN_URL) missing.push('ADMIN_URL');
  if (!CONFIG.ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  if (!CONFIG.PROJECT_DIR) missing.push('PROJECT_DIR');
  if (missing.length > 0) {
    log('FATAL', `Missing required env vars: ${missing.join(', ')}. Copy tools/.env.example to tools/.env and fill it in.`);
    process.exit(1);
  }
  if (!fs.existsSync(CONFIG.PROJECT_DIR)) {
    log('FATAL', `PROJECT_DIR does not exist: ${CONFIG.PROJECT_DIR}`);
    process.exit(1);
  }
}

// ---------- API helper ----------
async function api(method, pathStr, body) {
  const url = `${CONFIG.ADMIN_URL}${pathStr}`;
  /** @type {RequestInit} */
  const opts = {
    method,
    headers: { Authorization: `Bearer ${CONFIG.ADMIN_PASSWORD}` },
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${pathStr} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return text ? JSON.parse(text) : {};
}

// ---------- Heartbeat ----------
async function sendHeartbeat() {
  try {
    await api('GET', `/api/inbox/heartbeat?machine=${encodeURIComponent(CONFIG.MACHINE_NAME)}`);
    log('DEBUG', `Heartbeat sent (${CONFIG.MACHINE_NAME})`);
  } catch (err) {
    log('WARN', `Heartbeat failed: ${err.message}`);
  }
}

// ---------- Job execution ----------
function buildTasksMd(item) {
  const lines = [
    `# ${item.title}`,
    '',
    `**Priority:** ${item.priority}`,
  ];
  if (item.category) lines.push(`**Category:** ${item.category}`);
  lines.push(`**Job ID:** ${item.id}`);
  lines.push('');
  lines.push('## Instructions');
  lines.push('');
  lines.push(item.instructions || '_No instructions provided._');
  lines.push('');
  return lines.join('\n');
}

function truncate(s, max) {
  if (!s) return '';
  if (s.length <= max) return s;
  return s.slice(0, max) + `\n…[truncated ${s.length - max} chars]`;
}

function runClaude() {
  return new Promise(resolve => {
    log('INFO', `Spawning: claude -p "${CONFIG.CLAUDE_PROMPT.slice(0, 80)}…"`);
    const child = spawn('claude', ['--dangerously-skip-permissions', '-p', CONFIG.CLAUDE_PROMPT], {
      cwd: CONFIG.PROJECT_DIR,
      shell: true, // Windows resolves claude.cmd via the shell
    });

    let output = '';
    const timer = setTimeout(() => {
      output += `\n[timeout] killing process after ${CONFIG.MAX_JOB_MS}ms`;
      try { child.kill(); } catch { /* ignore */ }
    }, CONFIG.MAX_JOB_MS);

    child.stdout.on('data', d => { output += d.toString(); });
    child.stderr.on('data', d => { output += d.toString(); });
    child.on('error', err => {
      clearTimeout(timer);
      output += `\n[spawn error] ${err.message}`;
      resolve({ code: -1, output });
    });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, output });
    });
  });
}

async function runJob(item) {
  log('INFO', `Job #${item.id}: "${item.title}" (priority=${item.priority})`);

  try {
    await api('PUT', `/api/inbox/${item.id}`, { status: 'in-progress' });
    log('INFO', `Job #${item.id} → in-progress`);
  } catch (err) {
    log('ERROR', `Job #${item.id} couldn't be marked in-progress, skipping: ${err.message}`);
    return;
  }

  // Write tasks.md
  const tasksPath = path.join(CONFIG.PROJECT_DIR, 'tasks.md');
  const tasksContent = buildTasksMd(item);
  try {
    fs.writeFileSync(tasksPath, tasksContent, 'utf-8');
    log('INFO', `Wrote tasks.md (${tasksContent.length} chars)`);
  } catch (err) {
    log('ERROR', `Job #${item.id} failed to write tasks.md: ${err.message}`);
    await markFailed(item.id, `tasks.md write failed: ${err.message}`);
    return;
  }

  const startedAt = Date.now();
  const result = await runClaude();
  const durationMs = Date.now() - startedAt;
  log('INFO', `Job #${item.id} claude exit=${result.code} (${(durationMs / 1000).toFixed(1)}s)`);

  if (result.code === 0) {
    await markDone(item.id, result.output);
  } else {
    await markFailed(item.id, `exit ${result.code}\n\n${result.output}`);
  }
}

async function markDone(id, output) {
  try {
    await api('PUT', `/api/inbox/${id}`, {
      status: 'done',
      resultNotes: truncate(output, 4000),
    });
    log('INFO', `Job #${id} → done`);
  } catch (err) {
    log('ERROR', `Job #${id} failed to mark done: ${err.message}`);
  }
}

async function markFailed(id, output) {
  try {
    await api('PUT', `/api/inbox/${id}`, {
      status: 'failed',
      resultNotes: truncate(output, 4000),
    });
    log('ERROR', `Job #${id} → failed`);
  } catch (err) {
    log('ERROR', `Job #${id} failed to mark failed: ${err.message}`);
  }
}

// ---------- Cowork file-drop ingestion ----------
// Cowork writes tools/cowork-jobs.json with an array of job objects.
// On each poll the bridge checks for this file, POSTs each job to the
// inbox API, and deletes the file. This lets Cowork push jobs without
// needing direct network access to Vercel/Neon.
const COWORK_DROP_PATH = path.join(__dirname, 'cowork-jobs.json');

async function ingestCoworkJobs() {
  if (!fs.existsSync(COWORK_DROP_PATH)) return;
  let raw;
  try {
    raw = fs.readFileSync(COWORK_DROP_PATH, 'utf-8');
  } catch (err) {
    log('WARN', `Could not read cowork-jobs.json: ${err.message}`);
    return;
  }

  let jobs;
  try {
    jobs = JSON.parse(raw);
    if (!Array.isArray(jobs)) jobs = [jobs];
  } catch (err) {
    log('ERROR', `cowork-jobs.json is invalid JSON: ${err.message}`);
    // Rename so it doesn't block every cycle
    fs.renameSync(COWORK_DROP_PATH, COWORK_DROP_PATH + '.bad');
    return;
  }

  log('INFO', `Cowork drop: found ${jobs.length} job(s) to ingest`);
  let ok = 0;
  for (const job of jobs) {
    try {
      await api('POST', '/api/inbox', {
        title: job.title ?? 'Untitled job',
        priority: job.priority ?? 'medium',
        category: job.category ?? undefined,
        instructions: job.instructions ?? '',
      });
      ok++;
      log('INFO', `Cowork drop: added "${(job.title ?? '').slice(0, 60)}"`);
    } catch (err) {
      log('ERROR', `Cowork drop: failed to add "${(job.title ?? '').slice(0, 40)}": ${err.message}`);
    }
  }
  log('INFO', `Cowork drop: ${ok}/${jobs.length} ingested`);

  // Delete the file so we don't re-ingest next cycle
  try {
    fs.unlinkSync(COWORK_DROP_PATH);
  } catch { /* ignore */ }
}

// ---------- Poll loop ----------
async function pollOnce() {
  // Check for Cowork file-drop before polling execute queue
  await ingestCoworkJobs();

  try {
    const data = await api('GET', '/api/inbox/execute');
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) return;
    log('INFO', `Polled — ${items.length} job(s) ready`);
    for (const item of items) {
      await runJob(item);
    }
  } catch (err) {
    log('ERROR', `Poll failed: ${err.message}`);
  }
}

async function main() {
  validateConfig();
  log('INFO', '─'.repeat(60));
  log('INFO', `Bridge starting`);
  log('INFO', `URL:      ${CONFIG.ADMIN_URL}`);
  log('INFO', `Machine:  ${CONFIG.MACHINE_NAME}`);
  log('INFO', `Project:  ${CONFIG.PROJECT_DIR}`);
  log('INFO', `Poll:     every ${CONFIG.POLL_INTERVAL_MS}ms`);
  log('INFO', `Heartbeat: every ${CONFIG.HEARTBEAT_INTERVAL_MS}ms`);
  log('INFO', '─'.repeat(60));

  // Fire an initial heartbeat + poll without waiting on the timer.
  await sendHeartbeat();
  setInterval(sendHeartbeat, CONFIG.HEARTBEAT_INTERVAL_MS).unref?.();

  // Sequential poll loop using setTimeout — never overlaps a long-running job.
  // eslint-disable-next-line no-constant-condition
  async function loop() {
    await pollOnce();
    setTimeout(loop, CONFIG.POLL_INTERVAL_MS);
  }
  loop();
}

process.on('SIGINT', () => {
  log('INFO', 'Caught SIGINT, exiting.');
  process.exit(0);
});
process.on('SIGTERM', () => {
  log('INFO', 'Caught SIGTERM, exiting.');
  process.exit(0);
});
process.on('uncaughtException', err => {
  log('FATAL', `Uncaught: ${err.stack || err.message}`);
  process.exit(1);
});

main().catch(err => {
  log('FATAL', `Fatal: ${err.stack || err.message}`);
  process.exit(1);
});
