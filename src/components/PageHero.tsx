export default function PageHero({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <section style={{
      background: '#0A0F1E',
      padding: '5rem 2rem 4.5rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient glows */}
      <div style={{ position: 'absolute', top: '-180px', left: '25%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: '-80px', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.09), transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
        {label && (
          <p className="grad-text" style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{label}</p>
        )}
        <h1 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '3rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 1rem', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '1.125rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>{subtitle}</p>
        )}
      </div>
    </section>
  );
}
