import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'How We Review AI Tools — Our Process',
  description: 'Every AI tool on The AI Picker is scored out of 100 on five weighted factors. Full methodology and the quality gates we apply.',
};

export default function HowWeReviewPage() {
  const factors = [
    { name: 'Core Performance', weight: '30%', desc: 'Does it do its main job well? Accuracy, speed, reliability of the core feature set.' },
    { name: 'Ease of Use', weight: '20%', desc: 'Can a non-technical user figure it out quickly? Onboarding, interface clarity, documentation.' },
    { name: 'Value for Money', weight: '25%', desc: 'Is the price fair for what you get? Free tier, pricing tiers, feature-to-price ratio.' },
    { name: 'Output Quality', weight: '15%', desc: 'How good is the end result compared to competitors? Measured by community feedback and benchmarks.' },
    { name: 'Support & Reliability', weight: '10%', desc: 'Does it work consistently? Is help available when needed? Uptime, response times, documentation.' },
  ];

  return (
    <>
      <PageHero
        label="METHODOLOGY"
        title="How We Review AI Tools"
        subtitle="Every tool goes through the same rigorous process. Here's exactly how our scoring works."
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem' }}>Our Scoring System</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#475569', marginBottom: '2rem' }}>
            Every tool is rated out of 100 based on five weighted factors. We use a 100-point scale because it allows meaningful differentiation — an 82 versus a 77 tells a clearer story than a 4 versus a 4. Here&apos;s what each factor measures and how much it contributes to the overall score.
          </p>

          {factors.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'linear-gradient(135deg, #2563EB, #10B981)',
                color: '#FFFFFF',
                borderRadius: '0.625rem',
                padding: '0.5rem 0.875rem',
                fontSize: '1rem',
                fontWeight: 800,
                fontFamily: 'Inter,system-ui,sans-serif',
                flexShrink: 0,
                minWidth: '3.5rem',
                textAlign: 'center',
              }}>{f.weight}</div>
              <div>
                <h3 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.1875rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.375rem' }}>{f.name}</h3>
                <p style={{ fontSize: '0.9375rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}

          <div style={{ background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.75rem', border: '1px solid #E2E8F0', marginTop: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem' }}>Our Research Process</h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#475569', margin: '0 0 1rem' }}>
              For every tool we review, we analyse: official documentation and feature lists, published pricing and plan comparisons, user reviews across G2, Capterra, Trustpilot, and Reddit, community feedback and discussions, competitor positioning and alternatives, and any published benchmarks or case studies.
            </p>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#475569', margin: 0 }}>
              We use research-based language throughout our reviews: &quot;we researched&quot;, &quot;we compared&quot;, &quot;based on our analysis&quot;. We never claim hands-on testing or personal experiences that haven&apos;t genuinely happened. Our value is in doing the research legwork so you don&apos;t have to — not in pretending we&apos;ve used every tool ourselves.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
