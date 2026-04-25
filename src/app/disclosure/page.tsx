import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'How The AI Picker makes money, how it affects our reviews (it doesn\'t), and what it means for you as a reader.',
};

export default function DisclosurePage() {
  const commitments = [
    'Every review article includes an affiliate disclosure at the top',
    'Our scoring methodology is published and applied consistently',
    'We will always recommend the best tool for the use case, regardless of commission',
    'If a tool we recommend becomes worse, we update the review and the score',
    'We never accept payment for positive reviews or higher rankings',
  ];

  return (
    <>
      <PageHero
        dark={false}
        title="Affiliate Disclosure"
        subtitle="Full transparency about how we earn money and how it affects (and doesn't affect) our reviews."
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.875rem' }}>How We Earn Money</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#475569', marginBottom: '1.5rem' }}>
            The AI Picker is funded through affiliate commissions. When you click a &quot;Get Started&quot; link on our site and subsequently purchase a subscription or plan, we may receive a commission from the tool provider. This comes at no additional cost to you — you pay the same price as you would going directly to the tool&apos;s website.
          </p>

          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.875rem' }}>What This Means for Our Reviews</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#475569', marginBottom: '1.5rem' }}>
            Affiliate commissions never influence our scores, rankings, or recommendations. A tool offering 40% commission receives exactly the same honest assessment as a tool with no affiliate programme at all. We frequently recommend free tools or tools we earn nothing from when they&apos;re genuinely the best option.
          </p>

          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.875rem' }}>Our Commitment</h2>
          <div style={{ background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.75rem', border: '1px solid #E2E8F0' }}>
            {commitments.map((p, i) => (
              <div key={i} style={{ fontSize: '0.9375rem', color: '#475569', marginBottom: i < commitments.length - 1 ? '0.625rem' : 0, paddingLeft: '1.5rem', position: 'relative', lineHeight: 1.6 }}>
                <span className="grad-text" style={{ position: 'absolute', left: 0, fontWeight: 700 }}>✓</span>{p}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
