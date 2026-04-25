import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with The AI Picker team. Questions, feedback, corrections, or partnership enquiries.',
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Got a question, spotted an error, or want to suggest a tool? We'd love to hear from you."
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="article-content">
            <h2>Get in Touch</h2>
            <p>
              Email us at <a href="mailto:theaipicker@gmail.com">theaipicker@gmail.com</a> and
              we&apos;ll get back to you as quickly as we can.
            </p>

            <h2>What We Can Help With</h2>
            <ul>
              <li><strong>Tool suggestions</strong> — Know an AI tool we should review? Let us know.</li>
              <li><strong>Corrections</strong> — If we&apos;ve got something wrong, we want to fix it.</li>
              <li><strong>Partnerships</strong> — For affiliate or collaboration enquiries.</li>
              <li><strong>General feedback</strong> — Tell us what&apos;s working and what isn&apos;t.</li>
            </ul>

            <p>
              We read every email. If your message needs a response, you&apos;ll typically
              hear back within 48 hours.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
