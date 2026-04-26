'use client';

import { useActionState, useState } from 'react';
import { saveStreamAction, type StreamFormState } from './actions';
import type { Stream } from '@/lib/streams';

const ALL_DIRS = ['reviews', 'comparisons', 'best-of', 'guides', 'rankings'];

export default function StreamForm({ existing }: { existing?: Stream }) {
  const [state, formAction, pending] = useActionState<StreamFormState | null, FormData>(
    saveStreamAction,
    null,
  );
  const [open, setOpen] = useState(!!existing);

  if (!existing && !open) {
    return (
      <button type="button" className="admin-button-primary" onClick={() => setOpen(true)}>
        <span aria-hidden>＋</span> Add new stream
      </button>
    );
  }

  return (
    <form action={formAction} className="admin-form admin-stream-form">
      {state?.error && <div className="admin-form-error">{state.error}</div>}
      {state?.ok && <div className="admin-form-success">Saved.</div>}

      <div className="admin-stream-form-grid">
        <div className="admin-form-row">
          <label htmlFor="id" className="admin-form-label">Stream ID</label>
          <input
            id="id"
            name="id"
            type="text"
            placeholder="my-stream"
            defaultValue={existing?.id ?? ''}
            readOnly={!!existing}
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="admin-form-input"
          />
          <span className="admin-form-help">Lowercase letters, numbers, and hyphens. Cannot be changed after creation.</span>
        </div>
        <div className="admin-form-row">
          <label htmlFor="name" className="admin-form-label">Display name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={existing?.name ?? ''}
            required
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="domain" className="admin-form-label">Domain</label>
          <input
            id="domain"
            name="domain"
            type="text"
            placeholder="example.com"
            defaultValue={existing?.domain ?? ''}
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="status" className="admin-form-label">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={existing?.status ?? 'planned'}
            className="admin-form-select"
          >
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="admin-form-row admin-stream-form-grid-wide">
          <label htmlFor="tagline" className="admin-form-label">Tagline</label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            defaultValue={existing?.tagline ?? ''}
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row admin-stream-form-grid-wide">
          <span className="admin-form-label">Content directories</span>
          <div className="admin-stream-dirs">
            {ALL_DIRS.map(d => (
              <label key={d} className="admin-stream-dir">
                <input
                  type="checkbox"
                  name={`dir_${d}`}
                  defaultChecked={existing ? existing.contentDirs.includes(d) : false}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>
          <span className="admin-form-help">Articles in these folders belong to this stream.</span>
        </div>
        {!existing && (
          <div className="admin-form-row admin-stream-form-grid-wide">
            <label className="admin-stream-dir">
              <input type="checkbox" name="activate" />
              <span>Switch admin to this stream after saving</span>
            </label>
          </div>
        )}
      </div>

      <div className="admin-form-footer">
        {!existing && (
          <button type="button" className="admin-button-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="admin-button-primary">
          {pending ? 'Saving…' : existing ? 'Save changes' : 'Add stream'}
        </button>
      </div>
    </form>
  );
}
