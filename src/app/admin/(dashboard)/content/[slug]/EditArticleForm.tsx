'use client';

import { useActionState, useMemo, useState } from 'react';
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
  featuredImage: string;
  body: string;
  structuredData: StructuredData[];
  subdir: string;
  filename: string;
}

const WEIGHTS = {
  corePerformance: 0.30,
  easeOfUse: 0.20,
  valueForMoney: 0.25,
  outputQuality: 0.15,
  supportReliability: 0.10,
} as const;

interface ScoreState {
  corePerformance: number;
  easeOfUse: number;
  valueForMoney: number;
  outputQuality: number;
  supportReliability: number;
  bestFor: string;
  priceFrom: string;
  freePlan: string;
}

function computeOverall(s: ScoreState): number {
  const weighted =
    s.corePerformance * WEIGHTS.corePerformance +
    s.easeOfUse * WEIGHTS.easeOfUse +
    s.valueForMoney * WEIGHTS.valueForMoney +
    s.outputQuality * WEIGHTS.outputQuality +
    s.supportReliability * WEIGHTS.supportReliability;
  return Math.round(weighted);
}

function scoreClass(score: number): string {
  if (score >= 80) return 'admin-score high';
  if (score >= 65) return 'admin-score mid';
  return 'admin-score low';
}

function clampScore(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function freePlanFromStructured(value: string): 'Yes' | 'No' {
  return value.trim().toLowerCase().startsWith('y') ? 'Yes' : 'No';
}

export default function EditArticleForm(props: Props) {
  const [state, formAction, pending] = useActionState<UpdateState | null, FormData>(
    updateArticleAction,
    null,
  );

  const [featuredImage, setFeaturedImage] = useState(props.featuredImage);

  const initialScores: ScoreState[] = useMemo(
    () => props.structuredData.map(d => ({
      corePerformance: d.corePerformance,
      easeOfUse: d.easeOfUse,
      valueForMoney: d.valueForMoney,
      outputQuality: d.outputQuality,
      supportReliability: d.supportReliability,
      bestFor: d.bestFor,
      priceFrom: d.priceFrom,
      freePlan: freePlanFromStructured(d.freePlan),
    })),
    [props.structuredData],
  );

  const [scores, setScores] = useState<ScoreState[]>(initialScores);

  const updateScore = (idx: number, patch: Partial<ScoreState>) => {
    setScores(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  return (
    <form action={formAction} className="admin-form">
      <input type="hidden" name="originalSlug" value={props.slug} />
      <input type="hidden" name="sd_count" value={scores.length} />

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

      <div className="admin-form-section admin-form-section-wide">
        <h2 className="admin-form-section-title">Featured image</h2>
        <p className="admin-form-help" style={{ marginBottom: '0.25rem' }}>
          Path stored in frontmatter as <code>featured_image</code>. Use a path under <code>/public</code> (e.g. <code>/images/jasper-cover.png</code>) or a full URL.
        </p>
        <div className="admin-form-row">
          <label htmlFor="featuredImage" className="admin-form-label">Image path or URL</label>
          <input
            id="featuredImage"
            name="featuredImage"
            type="text"
            value={featuredImage}
            onChange={e => setFeaturedImage(e.target.value)}
            placeholder="/images/example-cover.png"
            className="admin-form-input"
          />
        </div>
        {featuredImage && (
          <div className="admin-featured-image-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featuredImage} alt="Featured image preview" />
          </div>
        )}
      </div>

      {scores.length > 0 && (
        <div className="admin-form-section admin-form-section-wide">
          <h2 className="admin-form-section-title">Scores</h2>
          <p className="admin-form-help" style={{ marginBottom: '0.75rem' }}>
            Edit factor scores out of 100. Overall score auto-calculates with weights 30/20/25/15/10. Saving writes the values back into the Structured Data block in the article body.
          </p>
          <div className="admin-score-edit-list">
            {scores.map((s, i) => {
              const block = props.structuredData[i];
              const overall = computeOverall(s);
              return (
                <div key={i} className="admin-score-edit-row">
                  <div className="admin-score-edit-head">
                    <div>
                      <strong>{block.toolName || `Tool ${i + 1}`}</strong>
                      {block.category && <span className="admin-form-help"> · {block.category}</span>}
                    </div>
                    <div className="admin-score-edit-overall">
                      <span className="admin-form-help">Overall</span>
                      <span className={scoreClass(overall)}>{overall}</span>
                      <input type="hidden" name={`sd_${i}_overallScore`} value={overall} />
                    </div>
                  </div>

                  <div className="admin-score-edit-grid">
                    <FactorInput
                      idx={i}
                      field="corePerformance"
                      label="Core Performance (30%)"
                      value={s.corePerformance}
                      onChange={v => updateScore(i, { corePerformance: v })}
                    />
                    <FactorInput
                      idx={i}
                      field="easeOfUse"
                      label="Ease of Use (20%)"
                      value={s.easeOfUse}
                      onChange={v => updateScore(i, { easeOfUse: v })}
                    />
                    <FactorInput
                      idx={i}
                      field="valueForMoney"
                      label="Value for Money (25%)"
                      value={s.valueForMoney}
                      onChange={v => updateScore(i, { valueForMoney: v })}
                    />
                    <FactorInput
                      idx={i}
                      field="outputQuality"
                      label="Output Quality (15%)"
                      value={s.outputQuality}
                      onChange={v => updateScore(i, { outputQuality: v })}
                    />
                    <FactorInput
                      idx={i}
                      field="supportReliability"
                      label="Support & Reliability (10%)"
                      value={s.supportReliability}
                      onChange={v => updateScore(i, { supportReliability: v })}
                    />
                  </div>

                  <div className="admin-score-edit-meta">
                    <div className="admin-form-row">
                      <label
                        htmlFor={`sd_${i}_bestFor`}
                        className="admin-form-label"
                      >Best For</label>
                      <input
                        id={`sd_${i}_bestFor`}
                        name={`sd_${i}_bestFor`}
                        type="text"
                        value={s.bestFor}
                        onChange={e => updateScore(i, { bestFor: e.target.value })}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-row">
                      <label
                        htmlFor={`sd_${i}_priceFrom`}
                        className="admin-form-label"
                      >Price From</label>
                      <input
                        id={`sd_${i}_priceFrom`}
                        name={`sd_${i}_priceFrom`}
                        type="text"
                        value={s.priceFrom}
                        onChange={e => updateScore(i, { priceFrom: e.target.value })}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-row">
                      <label
                        htmlFor={`sd_${i}_freePlan`}
                        className="admin-form-label"
                      >Free Plan</label>
                      <select
                        id={`sd_${i}_freePlan`}
                        name={`sd_${i}_freePlan`}
                        value={s.freePlan}
                        onChange={e => updateScore(i, { freePlan: e.target.value })}
                        className="admin-form-select"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
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

interface FactorInputProps {
  idx: number;
  field: keyof FactorScores;
  label: string;
  value: number;
  onChange: (n: number) => void;
}

type FactorScores = Pick<
  ScoreState,
  'corePerformance' | 'easeOfUse' | 'valueForMoney' | 'outputQuality' | 'supportReliability'
>;

function FactorInput({ idx, field, label, value, onChange }: FactorInputProps) {
  return (
    <div className="admin-form-row">
      <label htmlFor={`sd_${idx}_${field}`} className="admin-form-label">{label}</label>
      <input
        id={`sd_${idx}_${field}`}
        name={`sd_${idx}_${field}`}
        type="number"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={e => onChange(clampScore(e.target.value))}
        className="admin-form-input admin-score-input"
      />
    </div>
  );
}
