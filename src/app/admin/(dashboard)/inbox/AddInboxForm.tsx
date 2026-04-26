'use client';

import { useActionState, useRef, useEffect } from 'react';
import { addInboxItemAction, type AddInboxFormState } from './actions';
import { PRIORITIES, CATEGORIES } from '@/lib/inbox';

export default function AddInboxForm() {
  const [state, formAction, pending] = useActionState<AddInboxFormState | null, FormData>(
    addInboxItemAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && formRef.current) formRef.current.reset();
  }, [state?.ok]);

  return (
    <form ref={formRef} action={formAction} className="admin-form admin-inbox-form">
      {state?.error && <div className="admin-form-error">{state.error}</div>}
      {state?.ok && <div className="admin-form-success">Job added to the queue.</div>}

      <div className="admin-inbox-form-grid">
        <div className="admin-form-row admin-inbox-form-grid-wide">
          <label htmlFor="title" className="admin-form-label">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            className="admin-form-input"
            placeholder="What needs doing?"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="priority" className="admin-form-label">Priority</label>
          <select id="priority" name="priority" defaultValue="medium" className="admin-form-select">
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="admin-form-row">
          <label htmlFor="category" className="admin-form-label">Category</label>
          <select id="category" name="category" defaultValue="other" className="admin-form-select">
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="admin-form-row admin-inbox-form-grid-wide">
          <label htmlFor="instructions" className="admin-form-label">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            rows={4}
            className="admin-form-textarea"
            placeholder="Step-by-step instructions for the job."
          />
        </div>
      </div>

      <div className="admin-form-footer">
        <button type="submit" disabled={pending} className="admin-button-primary">
          {pending ? 'Adding…' : 'Add to inbox'}
        </button>
      </div>
    </form>
  );
}
