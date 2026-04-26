'use client';

import { useActionState } from 'react';
import { updateArticleAction, type UpdateState } from './actions';
import type { ArticleType } from '@/lib/admin-content';
import type { StructuredData } from '@/lib/content';

interface Props {
  slug: string;
  title: string;
  type: ArticleType;
  category: string;
  status: string;
  targetKeyword: string;
  metaTitle: string;
  metaDescription: string;
  body: string;
  structuredData: StructuredData[];
  subdir: string;
  filename: string;
}

function scoreClass(score: number): string {
  if (score >= 80) return 'admin-score high';
  if (score >= 65) return 'admin-score mid';
  return 'admin-score low';
}

export default function EditArticleForm(props: Props) {
  const [state, formAction, pending] = useActionState<UpdateState | null, FormData>(
    updateArticleAction,
    null,
  );

  return (
    <form action={formAction} className="admin-form">
      <input type="hidden" name="originalSlug" value={props.slug} />

      {state?.error && <div className="admin-form-error">{state.error}</div>}
      {state?.ok && <div className="admin-form-success">Saved.</div>}

      <div className="admin-form-grid">
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Basics</h2>

          <div className="admin-form-row">
            <span className="admin-form-label">Type</span>
            <div className="admin-form-locked">
              <span className={`admin-pill ${props.type}`}>{props.type.replace('-', ' ')}</span>
              <span className="admin-form-help">Type is locked. Create a new article to use a different type.</span>
            </div>
          </div>

          <div className="admin-form-row">
            <label htmlFor="title" className="admin-form-label">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={props.title}
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
              defaultValue={props.slug}
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="admin-form-input"
            />
            <span className="admin-form-help">
              Changing the slug renames the file. File: <code>content/{props.subdir}/{props.filename}</code>
            </span>
          </div>

          <div className="admin-form-row">
            <label htmlFor="category" className="admin-form-label">Category</label>
            <input
              id="category"
              name="category"
              type="text"
              defaultValue={props.category}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="status" className="admin-form-label">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={props.status === 'publish' ? 'publish' : 'draft'}
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
              defaultValue={props.targetKeyword}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="metaTitle" className="admin-form-label">Meta title</label>
            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              defaultValue={props.metaTitle}
              maxLength={70}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="metaDescription" className="admin-form-label">Meta description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={3}
              defaultValue={props.metaDescription}
              maxLength={200}
              className="admin-form-textarea"
            />
          </div>
        </div>
      </div>

      {props.structuredData.length > 0 && (
        <div className="admin-form-section admin-form-section-wide">
          <h2 className="admin-form-section-title">Scores</h2>
          <p className="admin-form-help" style={{ marginBottom: '0.75rem' }}>
            Read-only summary of structured data blocks parsed from the body. Edit scores directly in the markdown for now — a structured data editor lands in Phase 2.
          </p>
          <div className="admin-score-list">
            {props.structuredData.map((d, i) => (
              <div key={i} className="admin-score-row">
                <div className="admin-score-row-name">
                  <strong>{d.toolName}</strong>
                  <span className="admin-form-help">{d.category}</span>
                </div>
                <div className="admin-score-row-cells">
                  <ScorePill label="Overall" value={d.overallScore} />
                  <ScorePill label="Core" value={d.corePerformance} />
                  <ScorePill label="UX" value={d.easeOfUse} />
                  <ScorePill label="Value" value={d.valueForMoney} />
                  <ScorePill label="Output" value={d.outputQuality} />
                  <ScorePill label="Support" value={d.supportReliability} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-form-section admin-form-section-wide">
        <h2 className="admin-form-section-title">Body</h2>
        <textarea
          id="body"
          name="body"
          rows={28}
          defaultValue={props.body}
          className="admin-form-textarea admin-form-body"
        />
      </div>

      <div className="admin-form-footer">
        <button type="submit" disabled={pending} className="admin-button-primary">
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  if (!value) return null;
  return (
    <div className="admin-score-pill">
      <span className="admin-score-pill-label">{label}</span>
      <span className={scoreClass(value)}>{value}</span>
    </div>
  );
}
