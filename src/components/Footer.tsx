import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#1E293B', color: '#94A3B8', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>The AI Picker</p>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>We research AI tools so you don&apos;t have to. Independent, honest, scored out of 100.</p>
          </div>

          {/* Content */}
          <div>
            <p style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/rankings" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Rankings</Link>
              <Link href="/tools" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>All Tools</Link>
              <Link href="/compare" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Compare Tools</Link>
              <Link href="/guides" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Buyer Guides</Link>
            </div>
          </div>

          {/* About */}
          <div>
            <p style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/about" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>About Us</Link>
              <Link href="/how-we-review" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>How We Review</Link>
              <Link href="/editorial-standards" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Editorial Standards</Link>
              <Link href="/disclosure" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Affiliate Disclosure</Link>
              <Link href="/contact" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem' }}>Contact</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #334155', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.8125rem' }}>&copy; {new Date().getFullYear()} AI Digital Streams. All rights reserved.</p>
          <p style={{ fontSize: '0.8125rem' }}>Part of the AI Digital Streams portfolio</p>
        </div>
      </div>
    </footer>
  );
}
