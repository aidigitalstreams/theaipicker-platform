'use client';

import { useActionState, useEffect, useState } from 'react';
import { createArticleAction, type CreateState } from './actions';

const TYPES = [
  { value: 'review', label: 'Review' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'best-of', label: 'Best-of list' },
  { value: 'guide', label: 'Guide' },
  { value: 'ranking', label: 'Ranking' },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewArticleForm() {
  const [state, formAction, pending] = useActionState<CreateState | null, FormData>(
    createArticleAction,
    null,
  );

  const initial = state?.values;
  const [type, setType] = useState(initial?.type || 'review');
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  return (
    <form action={formAction} className="admin-form">
      {state?.error && <div className="admin-form-error">{state.error}</div>}

      <div className="admin-form-grid">
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Basics</h2>

          <div className="admin-form-row">
            <label htmlFor="type" className="admin-form-label">Type</label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={e => setType(e.target.value)}
              className="admin-form-select"
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-row">
            <label htmlFor="title" className="admin-form-label">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="slug" className="admin-form-label">Slug</label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="admin-form-input"
            />
            <span className="admin-form-help">Lowercase letters, numbers, single hyphens. This becomes the filename and URL.</span>
          </div>

          <div className="admin-form-row">
            <label htmlFor="category" className="admin-form-label">Category</label>
            <input
              id="category"
              name="category"
              type="text"
              defaultValue={initial?.category || ''}
              placeholder="e.g. AI Chatbots"
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="status" className="admin-form-label">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status || 'draft'}
              className="admin-form-select"
            >
              <option value="draft">Draft</option>
              <option value="publish">Published</option>
            </select>
          </div>
        </div>

        <div className="admin-form-section">
          <h2 className="admin-form-section-title">SEO</h2>

          <div className="admin-form-row">
            <label htmlFor="targetKeyword" className="admin-form-label">Target keyword</label>
            <input
              id="targetKeyword"
              name="targetKeyword"
              type="text"
              defaultValue={initial?.targetKeyword || ''}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="metaTitle" className="admin-form-label">Meta title</label>
            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              defaultValue={initial?.metaTitle || ''}
              maxLength={70}
              className="admin-form-input"
            />
            <span className="admin-form-help">Under 60 characters recommended. Defaults to article title if blank.</span>
          </div>

          <div className="admin-form-row">
            <label htmlFor="metaDescription" className="admin-form-label">Meta description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={3}
              defaultValue={initial?.metaDescription || ''}
              maxLength={200}
              className="admin-form-textarea"
            />
            <span className="admin-form-help">150–160 characters with a clear call to action.</span>
          </div>
        </div>
      </div>

      <div className="admin-form-section admin-form-section-wide">
        <h2 className="admin-form-section-title">Body</h2>
        <textarea
          id="body"
          name="body"
          rows={20}
          defaultValue={initial?.body || ''}
          className="admin-form-textarea admin-form-body"
          placeholder="Write the article in Markdown…"
        />
      </div>

      <div className="admin-form-footer">
        <button type="submit" disabled={pending} className="admin-button-primary">
          {pending ? 'Creating…' : 'Create article'}
        </button>
      </div>
    </form>
  );
}
