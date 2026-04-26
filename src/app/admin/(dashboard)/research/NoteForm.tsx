'use client';

import { useActionState, useState } from 'react';
import { saveNoteAction, type ResearchFormState } from './actions';
import { RESEARCH_KINDS } from '@/lib/research-kinds';
import type { ResearchNote } from '@/lib/research';

export default function NoteForm({ existing }: { existing?: ResearchNote }) {
  const [state, formAction, pending] = useActionState<ResearchFormState | null, FormData>(
    saveNoteAction,
    null,
  );
  const [open, setOpen] = useState(!!existing);

  if (!existing && !open) {
    return (
      <button type="button" className="admin-button-primary" onClick={() => setOpen(true)}>
        <span aria-hidden>＋</span> New research note
      </button>
    );
  }

  return (
    <form action={formAction} className="admin-form admin-research-form">
      {existing && <input type="hidden" name="id" value={existing.id} />}
      {state?.error && <div className="admin-form-error">{state.error}</div>}
      {state?.ok && <div className="admin-form-success">Saved.</div>}

      <div className="admin-research-form-grid">
        <div className="admin-form-row">
          <label htmlFor="kind" className="admin-form-label">Kind</label>
          <select
            id="kind"
            name="kind"
            defaultValue={existing?.kind ?? 'note'}
            className="admin-form-select"
          >
            {RESEARCH_KINDS.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>
        <div className="admin-form-row">
          <label htmlFor="status" className="admin-form-label">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={existing?.status ?? 'open'}
            className="admin-form-select"
          >
            <option value="open">Open</option>
            <option value="actioned">Actioned</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="admin-form-row admin-research-form-grid-wide">
          <label htmlFor="title" className="admin-form-label">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={existing?.title ?? ''}
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row admin-research-form-grid-wide">
          <label htmlFor="source" className="admin-form-label">Source / link</label>
          <input
            id="source"
            name="source"
            type="text"
            placeholder="Optional — URL, publication, or reference"
            defaultValue={existing?.source ?? ''}
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row admin-research-form-grid-wide">
          <label htmlFor="body" className="admin-form-label">Body</label>
          <textarea
            id="body"
            name="body"
            rows={6}
            defaultValue={existing?.body ?? ''}
            className="admin-form-textarea"
          />
        </div>
      </div>

      <div className="admin-form-footer">
        {!existing && (
          <button type="button" className="admin-button-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="admin-button-primary">
          {pending ? 'Saving…' : existing ? 'Save changes' : 'Add note'}
        </button>
      </div>
    </form>
  );
}
