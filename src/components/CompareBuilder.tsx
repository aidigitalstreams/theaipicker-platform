'use client';

import Link from 'next/link';
import { useState } from 'react';
import EmailCaptureForm from './EmailCaptureForm';

const catColors: Record<string, string> = {
  'AI Chatbots': '#EC4899',
  'AI Writing Tools': '#2563EB',
  'AI Voice Generators': '#8B5CF6',
  'AI Image Generators': '#10B981',
  'AI Video Tools': '#F59E0B',
  'AI Coding Assistants': '#06B6D4',
  'AI Meeting Assistants': '#F97316',
  'AI SEO Tools': '#14B8A6',
  'AI Music Generation': '#A855F7',
  'AI Presentation Tools': '#EC4899',
  'AI Transcription Tools': '#3B82F6',
};

function ScorePick({ score, size = 44 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <svg viewBox="0 0 36 44" width={size} height={size * 1.22} style={{ flexShrink: 0 }}>
      <path d="M18 1 C27 1 34 8.5 34 17.5 C34 29 23 40 18 44 C13 40 2 29 2 17.5 C2 8.5 9 1 18 1 Z" fill={`${color}18`} stroke={color} strokeWidth="1.8"/>
      <text x="18" y="20" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="800" fill={color} textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
}

interface ToolData {
  toolName: string;
  category: string;
  overallScore: number;
  corePerformance: number;
  easeOfUse: number;
  valueForMoney: number;
  outputQuality: number;
  supportReliability: number;
  priceFrom: string;
  freePlan: string;
  bestFor: string;
  slug?: string;
}

interface PopularComparison {
  slug: string;
  title: string;
  category: string;
  toolA?: string;
  toolB?: string;
  scoreA?: number;
  scoreB?: number;
}

export default function CompareBuilder({ tools, comparisons }: { tools: ToolData[]; comparisons: PopularComparison[] }) {
  const [selCat, setSelCat] = useState('');
  const [toolA, setToolA] = useState('');
  const [toolB, setToolB] = useState('');
  const [captureDismissed, setCaptureDismissed] = useState(false);

  // Get categories that have tools
  const categories = Array.from(new Set(tools.map(t => t.category))).sort();

  // Tools for selected category
  const catTools = selCat ? tools.filter(t => t.category === selCat).sort((a, b) => b.overallScore - a.overallScore) : [];

  const dataA = catTools.find(t => t.toolName === toolA);
  const dataB = catTools.find(t => t.toolName === toolB);
  const compared = dataA && dataB;

  const scoreColor = (s: number) => s >= 85 ? '#10B981' : s >= 75 ? '#2563EB' : s >= 65 ? '#F59E0B' : '#EF4444';

  const factors: { key: keyof ToolData; label: string; w: string }[] = [
    { key: 'corePerformance', label: 'Core Performance', w: '30%' },
    { key: 'easeOfUse', label: 'Ease of Use', w: '20%' },
    { key: 'valueForMoney', label: 'Value for Money', w: '25%' },
    { key: 'outputQuality', label: 'Output Quality', w: '15%' },
    { key: 'supportReliability', label: 'Support & Reliability', w: '10%' },
  ];

  const selectStyle: React.CSSProperties = {
    padding: '10px 14px', fontSize: '0.9375rem', fontWeight: 600, borderRadius: '0.5rem',
    border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A',
    cursor: 'pointer', outline: 'none', flex: 1, minWidth: 0, fontFamily: 'Inter,system-ui,sans-serif',
  };

  return (
    <>
      {/* Tool Selector */}
      <div style={{ background: '#F8FAFC', borderRadius: '0.875rem', padding: '2rem', border: '1px solid #E2E8F0', marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem', textAlign: 'center' }}>Select Tools to Compare</div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <select
            value={selCat}
            onChange={e => { setSelCat(e.target.value); setToolA(''); setToolB(''); }}
            style={{ ...selectStyle, flex: '0 1 220px' }}
          >
            <option value="">Choose category...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={toolA}
            onChange={e => setToolA(e.target.value)}
            disabled={!selCat}
            style={{ ...selectStyle, opacity: selCat ? 1 : 0.4 }}
          >
            <option value="">Tool A...</option>
            {catTools.filter(t => t.toolName !== toolB).map(t => <option key={t.toolName} value={t.toolName}>{t.toolName}</option>)}
          </select>
          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#94A3B8' }}>vs</span>
          <select
            value={toolB}
            onChange={e => setToolB(e.target.value)}
            disabled={!selCat}
            style={{ ...selectStyle, opacity: selCat ? 1 : 0.4 }}
          >
            <option value="">Tool B...</option>
            {catTools.filter(t => t.toolName !== toolA).map(t => <option key={t.toolName} value={t.toolName}>{t.toolName}</option>)}
          </select>
        </div>
      </div>

      {compared ? (
        <>
          {/* Disclosure */}
          <div className="disclosure" style={{ marginBottom: '2rem' }}>
            <strong>Affiliate Disclosure:</strong> Some links on this page are affiliate links. We may earn a commission if you make a purchase — at no extra cost to you.
          </div>

          {/* Quick Verdict */}
          <div style={{ background: '#F8FAFC', borderRadius: '0.875rem', padding: '2rem', border: '1px solid #E2E8F0', marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>Quick Verdict</h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748B', marginBottom: '1.5rem' }}>
              {dataA.overallScore > dataB.overallScore
                ? `${toolA} leads with ${dataA.overallScore}/100 vs ${dataB.overallScore}/100`
                : dataB.overallScore > dataA.overallScore
                ? `${toolB} leads with ${dataB.overallScore}/100 vs ${dataA.overallScore}/100`
                : `It's a tie — both score ${dataA.overallScore}/100`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {[{ name: toolA, score: dataA.overallScore }, { name: toolB, score: dataB.overallScore }].map((t, i) => (
                <div key={i} style={{ width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ScorePick score={t.score} size={48} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginTop: '0.375rem', marginBottom: '0.875rem' }}>{t.name}</div>
                  <span className="btn-primary" style={{ display: 'block', width: '100%', padding: '0.8rem 0', boxSizing: 'border-box', textAlign: 'center', borderRadius: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    Try {t.name} →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Factor-by-factor breakdown */}
          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem' }}>Score Breakdown</h2>
          <div style={{ borderRadius: '0.875rem', border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 0.8fr 0.6fr', padding: '0.875rem 1.25rem', background: '#0F172A', gap: '0.5rem' }}>
              {['Factor', 'Weight', toolA, toolB, 'Winner'].map(h => (
                <div key={h} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
              ))}
            </div>
            {factors.map((f, i) => {
              const a = dataA[f.key] as number;
              const b = dataB[f.key] as number;
              const winner = a > b ? toolA : b > a ? toolB : 'Tie';
              const winColor = winner === toolA ? scoreColor(a) : winner === toolB ? scoreColor(b) : '#F59E0B';
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 0.8fr 0.6fr', padding: '0.875rem 1.25rem', background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderTop: '1px solid #E2E8F0', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A' }}>{f.label}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>{f.w}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: scoreColor(a) }}>{a}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: scoreColor(b) }}>{b}</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: winColor }}>{winner}</div>
                </div>
              );
            })}
            {/* Overall row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 0.8fr 0.6fr', padding: '0.875rem 1.25rem', background: 'rgba(37,99,235,0.04)', borderTop: '2px solid #E2E8F0', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>Overall Score</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>100%</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ScorePick score={dataA.overallScore} size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ScorePick score={dataB.overallScore} size={24} />
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: dataA.overallScore > dataB.overallScore ? scoreColor(dataA.overallScore) : dataB.overallScore > dataA.overallScore ? scoreColor(dataB.overallScore) : '#F59E0B' }}>
                {dataA.overallScore > dataB.overallScore ? toolA : dataB.overallScore > dataA.overallScore ? toolB : 'Tie'}
              </div>
            </div>
          </div>

          {/* CTA cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[{ name: toolA, score: dataA.overallScore, slug: dataA.slug }, { name: toolB, score: dataB.overallScore, slug: dataB.slug }].map((t, i) => (
              <div key={i} style={{ background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.75rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <ScorePick score={t.score} size={44} />
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem', marginBottom: '1rem' }}>{t.name}</div>
                <span className="btn-primary" style={{ display: 'block', padding: '0.875rem 0', borderRadius: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'center' }}>
                  Get Started with {t.name} →
                </span>
              </div>
            ))}
          </div>

          {!captureDismissed && (
            <div style={{ marginBottom: '2.5rem' }}>
              <EmailCaptureForm
                source="comparison-builder"
                context={`${toolA} vs ${toolB}`}
                heading="Save this comparison"
                description={`Want this ${toolA} vs ${toolB} breakdown by email plus future score updates? We'll send it over. No spam — unsubscribe any time.`}
                buttonLabel="Send it to me"
                onDismiss={() => setCaptureDismissed(true)}
              />
            </div>
          )}
        </>
      ) : (
        /* Popular comparisons grid */
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.25rem', textAlign: 'center' }}>
            {comparisons.length > 0 ? 'Published Comparisons' : 'No comparisons yet'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {comparisons.map((p, i) => {
              const color = catColors[p.category] || '#64748B';
              return (
                <Link
                  key={i}
                  href={`/compare/${p.slug}`}
                  style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.875rem', padding: '1.25rem 1.5rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    {p.scoreA && p.scoreA > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                        <ScorePick score={p.scoreA} size={28} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>{p.toolA}</div>
                      </div>
                    )}
                    {p.scoreA && p.scoreB && <span style={{ fontSize: '1rem', fontWeight: 800, color: '#94A3B8' }}>vs</span>}
                    {p.scoreB && p.scoreB > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                        <ScorePick score={p.scoreB} size={28} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>{p.toolB}</div>
                      </div>
                    )}
                    {(!p.scoreA || !p.scoreB) && (
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>{p.title}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{p.category.replace('AI ', '')}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
