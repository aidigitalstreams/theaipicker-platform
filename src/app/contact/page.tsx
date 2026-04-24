import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with The AI Picker team. Questions, feedback, corrections, or partnership enquiries.',
};

export default function ContactPage() {
  return (
    <article style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '2rem', color: '#1E293B' }}>
        Contact Us
      </h1>

      <div className="article-content">
        <p>
          Got a question, spotted an error, or want to suggest a tool for us to review?
          We&apos;d love to hear from you.
        </p>

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
    </article>
  );
}
