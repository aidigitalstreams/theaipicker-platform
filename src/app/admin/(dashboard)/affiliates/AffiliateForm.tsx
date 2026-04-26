'use client';

import { useActionState, useState } from 'react';
import { saveAffiliateAction, type AffiliateFormState } from './actions';
import type { AffiliateProgram } from '@/lib/affiliate-data';

const STATUS_OPTIONS: { value: AffiliateProgram['status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paused', label: 'Paused' },
];

export default function AffiliateForm({ existing }: { existing?: AffiliateProgram }) {
  const [state, formAction, pending] = useActionState<AffiliateFormState | null, FormData>(
    saveAffiliateAction,
    null,
  );
  const [open, setOpen] = useState(!!existing);

  if (!existing && !open) {
    return (
      <button type="button" className="admin-button-primary" onClick={() => setOpen(true)}>
        <span aria-hidden>＋</span> Add affiliate program
      </button>
    );
  }

  return (
    <form action={formAction} className="admin-form admin-affiliate-form">
      {existing && <input type="hidden" name="id" value={existing.id} />}
      {state?.error && <div className="admin-form-error">{state.error}</div>}
      {state?.ok && <div className="admin-form-success">Saved.</div>}

      <div className="admin-affiliate-grid">
        <div className="admin-form-row">
          <label htmlFor="toolName" className="admin-form-label">Tool name</label>
          <input
            id="toolName"
            name="toolName"
            type="text"
            defaultValue={existing?.toolName ?? ''}
            required
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="commissionRate" className="admin-form-label">Commission rate</label>
          <input
            id="commissionRate"
            name="commissionRate"
            type="text"
            placeholder="e.g. 30% recurring"
            defaultValue={existing?.commissionRate ?? ''}
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="cookieDuration" className="admin-form-label">Cookie duration</label>
          <input
            id="cookieDuration"
            name="cookieDuration"
            type="text"
            placeholder="e.g. 60 days"
            defaultValue={existing?.cookieDuration ?? ''}
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="status" className="admin-form-label">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={existing?.status ?? 'pending'}
            className="admin-form-select"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="admin-form-row admin-affiliate-grid-wide">
          <label htmlFor="signupUrl" className="admin-form-label">Signup URL</label>
          <input
            id="signupUrl"
            name="signupUrl"
            type="url"
            placeholder="https://"
            defaultValue={existing?.signupUrl ?? ''}
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row admin-affiliate-grid-wide">
          <label htmlFor="notes" className="admin-form-label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={existing?.notes ?? ''}
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
          {pending ? 'Saving…' : existing ? 'Save changes' : 'Add program'}
        </button>
      </div>
    </form>
  );
}
