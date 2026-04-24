import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            We research AI tools<br />
            <span style={{ color: '#60A5FA' }}>so you don&apos;t have to.</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#94A3B8', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Every tool scored out of 100 across five weighted factors. Transparent methodology. Honest recommendations. No sponsored reviews.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/rankings" className="btn-primary" style={{ fontSize: '1rem' }}>
              Browse Rankings
            </Link>
            <Link href="/compare" className="btn-secondary" style={{ fontSize: '1rem', background: 'transparent', color: '#FFFFFF', border: '2px solid #60A5FA', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none' }}>
              Compare Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>Browse by Category</h2>
        <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '2.5rem' }}>Every category has its own leaderboard, ranked by our 5-factor scoring system.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { name: 'AI Writing Tools', slug: 'ai-writing-tools', count: '8 tools' },
            { name: 'AI Chatbots', slug: 'ai-chatbots', count: '6 tools' },
            { name: 'AI Image Generators', slug: 'ai-image-generators', count: '8 tools' },
            { name: 'AI Video Tools', slug: 'ai-video-tools', count: '7 tools' },
            { name: 'AI Voice Generators', slug: 'ai-voice-generators', count: '4 tools' },
            { name: 'AI Coding Assistants', slug: 'ai-coding-tools', count: '6 tools' },
            { name: 'AI SEO Tools', slug: 'ai-seo-tools', count: '5 tools' },
            { name: 'AI Meeting Assistants', slug: 'ai-meeting-assistants', count: '3 tools' },
            { name: 'AI Music Generation', slug: 'ai-music-generation', count: '3 tools' },
            { name: 'AI Presentation Tools', slug: 'ai-presentation-tools', count: '3 tools' },
            { name: 'AI Transcription Tools', slug: 'ai-transcription-tools', count: '4 tools' },
          ].map(cat => (
            <Link
              key={cat.slug}
              href={`/rankings/${cat.slug}`}
              className="card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.125rem' }}>{cat.name}</p>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{cat.count} reviewed</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How we review teaser */}
      <section style={{ background: '#F1F5F9', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>How We Score Tools</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { name: 'Core Performance', weight: '30%' },
              { name: 'Value for Money', weight: '25%' },
              { name: 'Ease of Use', weight: '20%' },
              { name: 'Output Quality', weight: '15%' },
              { name: 'Support', weight: '10%' },
            ].map(f => (
              <div key={f.name} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB' }}>{f.weight}</p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>{f.name}</p>
              </div>
            ))}
          </div>
          <Link href="/how-we-review" style={{ color: '#2563EB', fontWeight: 600 }}>Read our full methodology &rarr;</Link>
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
