import Link from 'next/link';
import { getAllStructuredData, getCategories } from '@/lib/content';

function ScorePick({ score, size = 40 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <svg viewBox="0 0 44 54" width={size} height={size * 1.2}>
      <defs>
        <linearGradient id={`tp${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
      </defs>
      <path d={`M22 1 C33 1 42 9.5 42 20.5 C42 34 27 49 22 53 C17 49 2 34 2 20.5 C2 9.5 11 1 22 1 Z`} fill={`url(#tp${score})`}/>
      <text x="22" y="26" fontFamily="Inter,system-ui,sans-serif" fontSize="16" fontWeight="800" fill="#FFF" textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
}

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

export default async function HomePage() {
  const allTools = await getAllStructuredData();
  const categories = await getCategories();

  const topTools = allTools
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section style={{
        background: '#0A0F1E',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '7.5rem',
        paddingBottom: '6.25rem',
        textAlign: 'center',
      }}>
        {/* Gradient glows */}
        <div style={{ position: 'absolute', top: '-200px', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '-100px', right: '15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          {/* NEW badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '0.5rem 1.25rem', marginBottom: '2rem' }}>
            <span className="grad-text" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>NEW</span>
            <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>{allTools.length} AI tools researched, scored, and ranked</span>
          </div>

          <h1 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '4.25rem', fontWeight: 800, lineHeight: 1.05, color: '#F8FAFC', margin: '0 0 1.5rem', letterSpacing: '-2px' }}>
            Find the right<br/>
            <span className="grad-text">AI tool</span> — faster
          </h1>

          <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#94A3B8', maxWidth: '580px', margin: '0 auto 2.75rem' }}>
            We research AI tools so you don&apos;t have to. Transparent scoring, honest verdicts, side-by-side comparisons.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/reviews" className="btn-primary" style={{ fontSize: '1rem' }}>
              Browse All Reviews &rarr;
            </Link>
            <Link href="/compare" className="btn-secondary" style={{ fontSize: '1rem' }}>
              Compare Tools
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '2.75rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
          {[
            { n: `${allTools.length}+`, l: 'Tools Researched' },
            { n: `${categories.length}`, l: 'Categories' },
            { n: '5', l: 'Weighted Factors' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div className="grad-text" style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '2.375rem', fontWeight: 800, marginBottom: '0.25rem' }}>{s.n}</div>
              <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="0 0 48 58" width={44} height={52} style={{ marginBottom: '0.125rem' }}>
              <defs>
                <linearGradient id="stpg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB"/>
                  <stop offset="100%" stopColor="#10B981"/>
                </linearGradient>
              </defs>
              <path d="M24 1 C36 1 46 10 46 22 C46 37 30 52 24 57 C18 52 2 37 2 22 C2 10 12 1 24 1 Z" fill="url(#stpg)" opacity="0.15"/>
              <path d="M24 1 C36 1 46 10 46 22 C46 37 30 52 24 57 C18 52 2 37 2 22 C2 10 12 1 24 1 Z" fill="none" stroke="url(#stpg)" strokeWidth="2"/>
              <text x="24" y="27" fontFamily="Inter,system-ui,sans-serif" fontSize="14" fontWeight="800" fill="url(#stpg)" textAnchor="middle" dominantBaseline="middle">/100</text>
            </svg>
            <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>Pick Score</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#F8FAFC', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="section-label">HOW IT WORKS</p>
            <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-1px' }}>Honest research. Clear verdicts.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { t: 'We Research', d: 'Deep-dive into features, pricing, user feedback, and documentation for every tool we cover.' },
              { t: 'We Score', d: 'Every tool rated /100 across 5 weighted factors: performance, ease of use, value, output quality, support.' },
              { t: 'We Compare', d: 'Side-by-side comparisons with real data — not sponsored rankings. The best tool wins, every time.' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem' }}>{s.t}</h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="section-label">CATEGORIES</p>
            <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-1px' }}>Every category. Scored and ranked.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {categories.map(cat => {
              const color = catColors[cat.name] || '#64748B';
              return (
                <Link
                  key={cat.slug}
                  href={`/tools/${cat.slug}`}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem 1.25rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, marginBottom: '0.875rem', boxShadow: `0 0 12px ${color}40` }}/>
                  <div style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>{cat.count} tools reviewed</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TOP TOOLS */}
      <section style={{ background: '#0A0F1E', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-200px', left: '30%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.1), transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="section-label">TOP RATED</p>
            <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-1px' }}>The tools leading every category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {topTools.map((tool, i) => (
              <div key={i} className="card-dark" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div>
                    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC' }}>{tool.toolName}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '0.1875rem' }}>{tool.category}</div>
                  </div>
                  <ScorePick score={tool.overallScore} size={40} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{tool.bestFor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: '#0A0F1E', padding: '5rem 2rem', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 0.875rem', letterSpacing: '-1px' }}>Stay ahead of AI</h2>
          <p style={{ fontSize: '1.0625rem', color: '#94A3B8', marginBottom: '2rem', lineHeight: 1.6 }}>New reviews, score changes, and pricing updates — delivered weekly.</p>
          <div style={{ display: 'flex', gap: '0.625rem', maxWidth: '460px', margin: '0 auto', background: 'rgba(255,255,255,0.06)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', padding: '0.3125rem' }}>
            <input type="text" placeholder="Enter your email" readOnly style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontSize: '0.9375rem', padding: '0.625rem 0.875rem', fontFamily: 'Inter,system-ui,sans-serif' }}/>
            <span className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem', borderRadius: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Subscribe</span>
          </div>
        </div>
      </section>

      {/* Disclosure */}
      <section style={{ maxWidth: '768px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.7 }}>
          Disclosure: We earn a commission if you make a purchase through our affiliate links, at no extra cost to you.
          This never influences our scores or recommendations. <Link href="/disclosure" style={{ color: '#2563EB' }}>Full disclosure</Link>.
        </p>
      </section>
    </>
  );
}
