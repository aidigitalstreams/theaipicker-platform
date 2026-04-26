import Link from 'next/link';
import type { FreeToolListing } from '@/lib/free-tools';

interface Props {
  tool: FreeToolListing;
  unlocked: boolean;
}

function scoreColor(score: number): string {
  if (score >= 85) return '#10B981';
  if (score >= 75) return '#2563EB';
  if (score >= 65) return '#F59E0B';
  return '#EF4444';
}

export default function FreeToolCard({ tool, unlocked }: Props) {
  const color = scoreColor(tool.overallScore);
  return (
    <article className="free-tool-card">
      <header className="free-tool-card-head">
        <div>
          <h3 className="free-tool-card-name">{tool.toolName}</h3>
          <div className="free-tool-card-category">{tool.category}</div>
        </div>
        <div className="free-tool-card-score" style={{ color, borderColor: `${color}30`, background: `${color}10` }}>
          {tool.overallScore}
          <span>/100</span>
        </div>
      </header>

      {tool.bestFor && (
        <p className="free-tool-card-bestfor">{tool.bestFor}</p>
      )}

      {unlocked ? (
        <>
          <dl className="free-tool-card-factors">
            <div>
              <dt>Core</dt>
              <dd>{tool.corePerformance}</dd>
            </div>
            <div>
              <dt>UX</dt>
              <dd>{tool.easeOfUse}</dd>
            </div>
            <div>
              <dt>Value</dt>
              <dd>{tool.valueForMoney}</dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd>{tool.outputQuality}</dd>
            </div>
            <div>
              <dt>Support</dt>
              <dd>{tool.supportReliability}</dd>
            </div>
          </dl>
          {tool.freePlanLimitations && tool.freePlanLimitations !== 'N/A' && (
            <p className="free-tool-card-limits">
              <strong>Free plan limits:</strong> {tool.freePlanLimitations}
            </p>
          )}
          {tool.priceFrom && (
            <p className="free-tool-card-price">
              <strong>Paid from:</strong> {tool.priceFrom}
            </p>
          )}
        </>
      ) : (
        <div className="free-tool-card-locked">
          Factor breakdown, free-plan limits, and verdict unlock with the email signup below.
        </div>
      )}

      {tool.reviewSlug && (
        <Link href={`/reviews/${tool.reviewSlug}`} className="free-tool-card-link">
          Read full review →
        </Link>
      )}
    </article>
  );
}
