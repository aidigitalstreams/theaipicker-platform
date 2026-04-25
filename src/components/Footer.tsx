import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3.5rem 2rem 2rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <svg viewBox="26 10 170 56" width={130} height={42}>
              <defs>
                <linearGradient id="lgf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#10B981"/></linearGradient>
                <linearGradient id="ltf" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#10B981"/></linearGradient>
              </defs>
              <path d="M48 14 C58 14 66 22 66 33 C66 46 54 58 48 62 C42 58 30 46 30 33 C30 22 38 14 48 14 Z" fill="url(#lgf)"/>
              <text x="48" y="42" fontFamily="Inter,system-ui,sans-serif" fontSize="17" fontWeight="800" fill="#FFF" textAnchor="middle">AI</text>
              <text x="84" y="31" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="600" fill="url(#ltf)" letterSpacing="4">THE AI</text>
              <text x="84" y="58" fontFamily="Inter,system-ui,sans-serif" fontSize="30" fontWeight="800" fill="#F8FAFC">Picker</text>
            </svg>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.7, marginTop: '1rem', maxWidth: '260px' }}>
              We research AI tools so you don&apos;t have to. Transparent scoring, honest verdicts, zero hype.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p style={{ color: '#F8FAFC', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Explore</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/tools" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>All Tools</Link>
              <Link href="/rankings" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Rankings</Link>
              <Link href="/compare" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Compare</Link>
              <Link href="/best" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Best Of</Link>
              <Link href="/guides" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Guides</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p style={{ color: '#F8FAFC', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Categories</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/rankings/rankings-ai-chatbots" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Chatbots</Link>
              <Link href="/rankings/rankings-ai-writing-tools" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Writing</Link>
              <Link href="/rankings/rankings-ai-voice-generators" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Voice</Link>
              <Link href="/rankings/rankings-ai-image-generators" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Image</Link>
              <Link href="/rankings/rankings-ai-video-tools" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Video</Link>
              <Link href="/rankings/rankings-ai-coding-assistants" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Coding</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p style={{ color: '#F8FAFC', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Company</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/about" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>About</Link>
              <Link href="/how-we-review" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>How We Review</Link>
              <Link href="/disclosure" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Disclosure</Link>
              <Link href="/editorial-standards" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Editorial Standards</Link>
              <Link href="/contact" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Contact</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>&copy; {new Date().getFullYear()} The AI Picker &mdash; AI Digital Streams</span>
          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>theaipicker.com</span>
        </div>
      </div>
    </footer>
  );
}
