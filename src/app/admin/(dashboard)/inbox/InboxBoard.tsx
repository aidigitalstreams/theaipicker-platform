'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  CATEGORIES,
  type InboxItem,
  type InboxPriority,
  type InboxStatus,
} from '@/lib/inbox';
import {
  executeSelectedAction,
  reorderInboxAction,
  completeInboxItemAction,
  deleteInboxItemAction,
} from './actions';

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));

function priorityClass(p: InboxPriority): string {
  return `admin-inbox-priority priority-${p}`;
}

function statusPillClass(s: InboxStatus): string {
  switch (s) {
    case 'queued': return 'admin-pill status-pending';
    case 'execute-requested': return 'admin-pill status-ready';
    case 'in-progress': return 'admin-pill status-in-review';
    case 'done': return 'admin-pill status-active';
    case 'failed': return 'admin-pill severity-error';
    default: return 'admin-pill';
  }
}

function formatRelative(iso: string | null): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildTaskList(items: InboxItem[]): string {
  return items.map((item, i) => {
    const lines = [`${i + 1}. ${item.title} (${PRIORITY_LABELS[item.priority]})`];
    if (item.category) lines.push(`   Category: ${CATEGORY_LABELS[item.category] ?? item.category}`);
    if (item.instructions) {
      const indented = item.instructions
        .split('\n')
        .map(l => `   ${l}`)
        .join('\n');
      lines.push(indented);
    }
    return lines.join('\n');
  }).join('\n\n');
}

interface Props {
  items: InboxItem[];
}

export default function InboxBoard({ items: initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [, startTransition] = useTransition();

  // Sync from props when the server revalidates after an action.
  // We key on id-order so optimistic local reorders are preserved between renders.
  const initialKey = initialItems.map(i => `${i.id}:${i.status}:${i.executionOrder}`).join('|');
  useEffect(() => {
    setItems(initialItems);
    setSelected(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  // Auto-refresh: poll for updates every 8 seconds so the UI
  // reflects bridge status changes without manual page refresh.
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 8_000);
    return () => clearInterval(interval);
  }, [router]);

  const toggleSelected = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpanded = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedItems = items.filter(i => selected.has(i.id));
  const selectedCount = selectedItems.length;

  function moveSelected(direction: 'up' | 'down') {
    if (selectedCount === 0) return;
    const selectedIdxs = items.map((it, i) => selected.has(it.id) ? i : -1).filter(i => i >= 0);
    const next = [...items];

    if (direction === 'up') {
      // Iterate top-down; each selected item swaps with the one above (if it's not already at top
      // or pinned by another selected item).
      for (const idx of selectedIdxs) {
        if (idx > 0 && !selected.has(next[idx - 1].id)) {
          [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
        }
      }
    } else {
      // Bottom-up.
      for (let k = selectedIdxs.length - 1; k >= 0; k--) {
        const idx = selectedIdxs[k];
        if (idx < next.length - 1 && !selected.has(next[idx + 1].id)) {
          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        }
      }
    }

    setItems(next);

    const formData = new FormData();
    for (const it of next) formData.append('orderedId', String(it.id));
    startTransition(() => {
      reorderInboxAction(formData);
    });
  }

  function executeSelected() {
    if (selectedCount === 0) return;
    const formData = new FormData();
    for (const it of selectedItems) formData.append('id', String(it.id));
    startTransition(() => {
      executeSelectedAction(formData).then(() => setSelected(new Set()));
    });
  }

  async function copyAsTasks() {
    const target = selectedCount > 0 ? selectedItems : items;
    if (target.length === 0) return;
    const text = buildTaskList(target);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  function complete(id: number) {
    const formData = new FormData();
    formData.append('id', String(id));
    startTransition(() => {
      completeInboxItemAction(formData);
    });
  }

  function remove(id: number) {
    const formData = new FormData();
    formData.append('id', String(id));
    startTransition(() => {
      deleteInboxItemAction(formData);
    });
  }

  if (items.length === 0) {
    return (
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Inbox is empty</h2>
            <div className="admin-card-sub">
              Drop a job into the form above. It'll queue up here ready to execute.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-inbox-board">
      <div className="admin-inbox-actions">
        <div className="admin-inbox-selection-meta">
          {selectedCount > 0
            ? <span><strong>{selectedCount}</strong> selected</span>
            : <span className="admin-form-help">Select rows to enable execute / reorder.</span>}
        </div>

        {selectedCount > 0 && (
          <div className="admin-inbox-reorder-panel">
            <button
              type="button"
              className="admin-button-ghost"
              onClick={() => moveSelected('up')}
              aria-label="Move selected up"
            >
              ↑
            </button>
            <button
              type="button"
              className="admin-button-ghost"
              onClick={() => moveSelected('down')}
              aria-label="Move selected down"
            >
              ↓
            </button>
          </div>
        )}

        <button
          type="button"
          className="admin-button-success"
          onClick={executeSelected}
          disabled={selectedCount === 0}
        >
          Execute ({selectedCount})
        </button>
        <button
          type="button"
          className="admin-button-primary"
          onClick={copyAsTasks}
          disabled={items.length === 0}
        >
          {copyState === 'copied'
            ? 'Copied ✓'
            : copyState === 'failed'
              ? 'Copy failed'
              : `Copy as Tasks${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
        </button>
      </div>

      <ul className="admin-inbox-list">
        {items.map(item => {
          const isSelected = selected.has(item.id);
          const isExpanded = expanded.has(item.id);
          return (
            <li
              key={item.id}
              className={`admin-inbox-row${isSelected ? ' selected' : ''}${isExpanded ? ' expanded' : ''}`}
            >
              <label className="admin-inbox-checkbox" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelected(item.id)}
                />
              </label>

              <button
                type="button"
                className="admin-inbox-row-main"
                onClick={() => toggleExpanded(item.id)}
                aria-expanded={isExpanded}
              >
                <div className="admin-inbox-row-head">
                  <span className={priorityClass(item.priority)}>
                    {PRIORITY_LABELS[item.priority]}
                  </span>
                  <span className={statusPillClass(item.status)}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  {item.category && (
                    <span className="admin-pill kind-other">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                  )}
                  <span className="admin-inbox-row-title">{item.title}</span>
                </div>
                <div className="admin-inbox-row-meta">
                  <span>#{item.executionOrder + 1}</span>
                  <span>{formatRelative(item.createdDate)}</span>
                </div>
              </button>

              <button
                type="button"
                className="admin-button-ghost"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); toggleExpanded(item.id); }}
                title={isExpanded ? 'Collapse' : 'View instructions'}
              >
                {isExpanded ? '▲' : '▼'}
              </button>

              <button
                type="button"
                className="admin-button-danger"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginRight: '0.5rem', flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                title="Delete job"
              >
                ✕
              </button>

              {isExpanded && (
                <div className="admin-inbox-row-body">
                  {item.instructions
                    ? <pre className="admin-inbox-instructions">{item.instructions}</pre>
                    : <p className="admin-form-help" style={{ margin: 0 }}>No instructions.</p>}
                  <div className="admin-inbox-row-actions">
                    <button
                      type="button"
                      className="admin-button-ghost"
                      onClick={() => complete(item.id)}
                    >
                      Mark done
                    </button>
                    <button
                      type="button"
                      className="admin-button-danger"
                      onClick={() => remove(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
