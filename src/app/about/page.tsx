import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'About The AI Picker — Who We Are & Why We Do This',
  description: 'The AI Picker is an independent AI tool review site. We research tools thoroughly, compare them fairly, and tell you what\'s actually worth paying for.',
};

export default function AboutPage() {
  const cards = [
    { t: 'Transparent Scoring', d: 'Every score is broken down across 5 weighted factors. No black boxes.' },
    { t: 'Research-Based', d: "We analyse documentation, user feedback, and community data. We never claim hands-on testing we haven't done." },
    { t: 'No Sponsored Rankings', d: 'Commission rates never influence scores. A tool with 40% commission gets the same honest review as one with 0%.' },
    { t: 'Updated Regularly', d: 'AI tools change fast. We re-review tools when they ship major updates.' },
  ];

  return (
    <>
      <PageHero
        label="ABOUT US"
        title="We research AI tools so you don't have to"
        subtitle="The AI Picker is an independent review site. No sponsored rankings. No inflated scores. Just honest research."
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem' }}>Why We Exist</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#475569', marginBottom: '1.5rem' }}>
            There are thousands of AI tools available today, and the landscape changes weekly. New tools launch, existing tools update, pricing changes, features get added or removed. Keeping up is a full-time job — so we made it ours.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#475569', marginBottom: '2.5rem' }}>
            The AI Picker exists to cut through the noise. We research every tool we cover using the same rigorous methodology: analysing features, pricing, user feedback, documentation, and community sentiment. Every tool gets scored /100 across five weighted factors, and every score is broken down so you can see exactly why.
          </p>

          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem' }}>What Makes Us Different</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            {cards.map((p, i) => (
              <div key={i} style={{ background: '#F8FAFC', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>{p.t}</h3>
                <p style={{ fontSize: '0.9375rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>{p.d}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem' }}>How We Make Money</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#475569' }}>
            When you click a &quot;Get Started&quot; link and sign up for a tool, we may earn a commission from that tool&apos;s affiliate programme. This is how we fund the site. Crucially, this never influences our scores or recommendations — we disclose the relationship at the top of every article, and we frequently recommend free tools or tools with no affiliate programme when they&apos;re the best option.
          </p>
        </div>
      </section>
    </>
  );
}
