'use client';

import { useActionState } from 'react';
import { saveRevenueAction, type RevenueFormState } from './actions';

export default function RevenueEntryForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, pending] = useActionState<RevenueFormState | null, FormData>(
    saveRevenueAction,
    null,
  );

  return (
    <form action={formAction} className="admin-revenue-form">
      {state?.error && <div className="admin-form-error">{state.error}</div>}
      {state?.ok && <div className="admin-form-success">Entry saved.</div>}

      <div className="admin-revenue-form-grid">
        <div className="admin-form-row">
          <label htmlFor="date" className="admin-form-label">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="toolName" className="admin-form-label">Tool / source</label>
          <input
            id="toolName"
            name="toolName"
            type="text"
            placeholder="e.g. Jasper"
            required
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="amount" className="admin-form-label">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            className="admin-form-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="currency" className="admin-form-label">Currency</label>
          <select
            id="currency"
            name="currency"
            defaultValue="GBP"
            className="admin-form-select"
          >
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div className="admin-form-row admin-revenue-form-grid-wide">
          <label htmlFor="notes" className="admin-form-label">Notes</label>
          <input
            id="notes"
            name="notes"
            type="text"
            placeholder="Optional"
            className="admin-form-input"
          />
        </div>
      </div>

      <div className="admin-form-footer">
        <button type="submit" disabled={pending} className="admin-button-primary">
          {pending ? 'Saving…' : 'Add entry'}
        </button>
      </div>
    </form>
  );
}
