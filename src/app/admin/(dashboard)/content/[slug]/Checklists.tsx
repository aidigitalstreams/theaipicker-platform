import {
  buildCtaChecklist,
  type ChecklistResult,
} from '@/lib/content-checks';
import type { ArticleType } from '@/lib/admin-content';

interface Props {
  body: string;
  type: ArticleType;
  toolCount: number;
}

function Checklist({ title, result }: { title: string; result: ChecklistResult }) {
  const ratio = result.totalCount === 0 ? 0 : result.passedCount / result.totalCount;
  const status = ratio === 1 ? 'complete' : ratio >= 0.7 ? 'good' : 'incomplete';
  return (
    <div className={`admin-checklist admin-checklist-${status}`}>
      <div className="admin-checklist-head">
        <h3 className="admin-checklist-title">{title}</h3>
        <span className="admin-checklist-score">
          {result.passedCount} / {result.totalCount}
        </span>
      </div>
      <ul className="admin-checklist-items">
        {result.items.map((item, i) => (
          <li
            key={i}
            className={`admin-checklist-item ${item.passed ? 'passed' : 'failed'}`}
          >
            <span className="admin-checklist-mark" aria-hidden="true">
              {item.passed ? '✓' : '○'}
            </span>
            <span className="admin-checklist-label">{item.label}</span>
            {item.detail && (
              <span className="admin-checklist-detail">{item.detail}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Checklists(props: Props) {
  const ctaResult = buildCtaChecklist(props.body, props.type, props.toolCount);

  return (
    <div className="admin-form-section admin-form-section-wide">
      <h2 className="admin-form-section-title">Pre-publish checks</h2>
      <p className="admin-form-help" style={{ marginBottom: '0.75rem' }}>
        Snapshot of required CTA placements based on the saved article. Refreshes after every save.
      </p>
      <div className="admin-checklist-grid">
        <Checklist title="CTA placement" result={ctaResult} />
      </div>
    </div>
  );
}
