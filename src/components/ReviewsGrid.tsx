'use client';

import Link from 'next/link';
import { useState } from 'react';

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
    <svg viewBox="0 0 60 72" width={size} height={size * 1.2} style={{ flexShrink: 0, filter: `drop-shadow(0 0 ${size * 0.15}px ${color}30)` }}>
      <path d="M30 0 C45.5 0 58 12 58 27.5 C58 46.5 37 66 30 72 C23 66 2 46.5 2 27.5 C2 12 14.5 0 30 0 Z" fill={color} opacity="0.15"/>
      <path d="M30 2 C44 2 56 13 56 27 C56 45 36 63 30 70 C24 63 4 45 4 27 C4 13 16 2 30 2 Z" fill={`${color}10`}/>
      <path d="M30 2 C44 2 56 13 56 27 C56 45 36 63 30 70 C24 63 4 45 4 27 C4 13 16 2 30 2 Z" fill="none" stroke={color} strokeWidth="2.5"/>
      <text x="30" y="36" fontFamily="Inter,system-ui,sans-serif" fontSize={size * 0.32} fontWeight="800" fill={color} textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
}

interface ReviewItem {
  slug: string;
  title: string;
  category: string;
  overallScore?: number;
  bestFor?: string;
}

export default function ReviewsGrid({ reviews }: { reviews: ReviewItem[] }) {
  const [filter, setFilter] = useState<string | null>(null);

  // Build category list with counts
  const catMap = new Map<string, number>();
  for (const r of reviews) {
    const cat = r.category || 'Uncategorised';
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  }
  const categories = Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const filtered = filter ? reviews.filter(r => r.category === filter) : reviews;

  return (
    <>
      {/* Category filter */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Filter by Category</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>—</span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563EB' }}>{reviews.length} Total Reviews</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {categories.map(([name, count]) => {
            const color = catColors[name] || '#64748B';
            const active = filter === name;
            return (
              <button
                key={name}
                onClick={() => setFilter(active ? null : name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: active ? '#F8FAFC' : 'transparent',
                  border: active ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
                  color: active ? '#2563EB' : '#475569',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40`, flexShrink: 0 }} />
                {name}
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: active ? '#2563EB' : '#94A3B8', marginLeft: '0.125rem' }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      {filter && (
        <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.25rem' }}>{filtered.length} review{filtered.length !== 1 ? 's' : ''} found</div>
      )}

      {/* Review cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(r => {
          const color = catColors[r.category] || '#64748B';
          return (
            <Link
              key={r.slug}
              href={`/reviews/${r.slug}`}
              style={{
                background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.5rem', border: '1px solid #E2E8F0',
                textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{r.category}</span>
                  </div>
                  <div style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {r.title.replace(/ Review.*$/, '').replace(/ \(2026\).*$/, '')}
                  </div>
                </div>
                {r.overallScore && r.overallScore > 0 && (
                  <ScorePick score={r.overallScore} size={44} />
                )}
              </div>
              {r.bestFor && (
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#475569', margin: '0 0 1rem', flex: 1 }}>{r.bestFor}</p>
              )}
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB' }}>Read Full Review →</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
