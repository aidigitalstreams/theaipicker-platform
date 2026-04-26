import { PHASES, phaseProgress, phaseStatus, type PhaseStatus } from '@/lib/roadmap';

const STATUS_LABEL: Record<PhaseStatus, string> = {
  complete: 'Complete',
  'in-progress': 'In progress',
  planned: 'Planned',
};

export default function RoadmapPage() {
  const totalItems = PHASES.reduce((sum, p) => sum + p.items.length, 0);
  const totalDone = PHASES.reduce((sum, p) => sum + p.items.filter(i => i.done).length, 0);
  const overall = totalItems === 0 ? 0 : Math.round((totalDone / totalItems) * 100);

  const definedPhases = PHASES.length;
  const completePhases = PHASES.filter(p => phaseStatus(p) === 'complete').length;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Overview</div>
          <h1>Roadmap</h1>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
          {completePhases} of {definedPhases} phases shipped · {overall}% of items
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Phases shipped</div>
            <div className="admin-stat-value">{completePhases}</div>
            <div className="admin-stat-delta">of {definedPhases} defined</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Items complete</div>
            <div className="admin-stat-value">{totalDone}</div>
            <div className="admin-stat-delta">of {totalItems} total</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Overall progress</div>
            <div className="admin-stat-value">{overall}%</div>
            <div className="admin-stat-delta">Across all defined items</div>
          </div>
        </div>

        <div className="admin-roadmap-grid">
          {PHASES.map(phase => {
            const status = phaseStatus(phase);
            const progress = phaseProgress(phase);
            return (
              <div
                key={phase.number}
                className={`admin-roadmap-card status-${status}`}
              >
                <div className="admin-roadmap-head">
                  <div>
                    <div className="admin-roadmap-num">Phase {phase.number}</div>
                    <h3 className="admin-roadmap-title">{phase.title}</h3>
                  </div>
                  <span className={`admin-roadmap-status status-${status}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>

                <p className="admin-roadmap-summary">{phase.summary}</p>

                {phase.items.length > 0 && (
                  <>
                    <div className="admin-roadmap-progress">
                      <div className="admin-roadmap-progress-bar">
                        <div
                          className="admin-roadmap-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="admin-roadmap-progress-label">{progress}%</span>
                    </div>

                    <ul className="admin-roadmap-items">
                      {phase.items.map((item, idx) => (
                        <li
                          key={idx}
                          className={`admin-roadmap-item${item.done ? ' done' : ''}`}
                        >
                          <span className="admin-roadmap-check" aria-hidden="true">
                            {item.done ? '✓' : ''}
                          </span>
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
