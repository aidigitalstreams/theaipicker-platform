'use client';

import { useActionState } from 'react';
import { saveNewsletterAction, type NewsletterFormState } from './actions';
import type { Newsletter } from '@/lib/newsletters';

function toLocalDatetime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewsletterForm({ existing }: { existing?: Newsletter }) {
  const [state, formAction, pending] = useActionState<NewsletterFormState | null, FormData>(
    saveNewsletterAction,
    null,
  );

  const status = existing?.status ?? 'draft';

  return (
    <form action={formAction} className="admin-form">
      {existing && <input type="hidden" name="id" value={existing.id} />}
      {state?.error && <div className="admin-form-error">{state.error}</div>}
      {state?.ok && <div className="admin-form-success">Saved.</div>}

      <div className="admin-form-grid">
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Header</h2>

          <div className="admin-form-row">
            <label htmlFor="subject" className="admin-form-label">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              defaultValue={existing?.subject ?? ''}
              required
              maxLength={120}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="preview" className="admin-form-label">Preview text</label>
            <input
              id="preview"
              name="preview"
              type="text"
              defaultValue={existing?.preview ?? ''}
              maxLength={120}
              className="admin-form-input"
            />
            <span className="admin-form-help">
              Shown next to the subject in inbox previews. Keep under 90 chars.
            </span>
          </div>
        </div>

        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Status</h2>

          <div className="admin-form-row">
            <label htmlFor="status" className="admin-form-label">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="admin-form-select"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
            </select>
          </div>

          <div className="admin-form-row">
            <label htmlFor="scheduledAt" className="admin-form-label">Scheduled for</label>
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              defaultValue={toLocalDatetime(existing?.scheduledAt)}
              className="admin-form-input"
            />
            <span className="admin-form-help">
              Required when status is &quot;Scheduled&quot;.
            </span>
          </div>
        </div>
      </div>

      <div className="admin-form-section admin-form-section-wide">
        <h2 className="admin-form-section-title">Body</h2>
        <textarea
          id="body"
          name="body"
          rows={20}
          defaultValue={existing?.body ?? ''}
          className="admin-form-textarea admin-form-body"
        />
        <span className="admin-form-help">
          Markdown is fine. The send-flow against the email platform isn&apos;t wired yet — content lives in newsletters.json until then.
        </span>
      </div>

      <div className="admin-form-footer">
        <button type="submit" disabled={pending} className="admin-button-primary">
          {pending ? 'Saving…' : existing ? 'Save changes' : 'Save draft'}
        </button>
      </div>
    </form>
  );
}
