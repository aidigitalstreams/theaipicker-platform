import Link from 'next/link';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import PageHero from '@/components/PageHero';
import FreeToolCard from '@/components/FreeToolCard';
import EmailCaptureForm from '@/components/EmailCaptureForm';
import { getFreeTools, getFreeToolCategories } from '@/lib/free-tools';

export const metadata: Metadata = {
  title: 'Best Free AI Tools — Researched & Ranked',
  description: 'Curated leaderboard of the best AI tools with genuinely usable free plans. Scored out of 100 across five weighted factors. Honest research, transparent methodology.',
};

const FREE_TOOLS_COOKIE = 'aids_free_unlocked';

export default async function FreeToolsHub() {
  const tools = await getFreeTools();
  const categories = await getFreeToolCategories();
  const cookieStore = await cookies();
  const unlocked = cookieStore.get(FREE_TOOLS_COOKIE)?.value === '1';

  return (
    <>
      <PageHero
        label="FREE TOOLS"
        title="Best Free AI Tools"
        subtitle={`Every AI tool we've reviewed with a genuinely usable free plan, ranked by overall score. ${tools.length} tools across ${categories.length} categories.`}
      />

      <section style={{ background: '#FFFFFF', padding: '4rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="free-tools-categories">
            {categories.map(c => (
              <Link key={c.slug} href={`/free-tools/${c.slug}`} className="free-tools-category-pill">
                {c.name} <span>{c.count}</span>
              </Link>
            ))}
          </div>

          {!unlocked && (
            <div className="free-tools-gate-banner">
              <EmailCaptureForm
                source="free-tools"
                heading="Unlock the full breakdown"
                description="Tool names, scores, and the one-line summary are public. Drop your email to unlock factor breakdowns, free-plan limits, and full verdicts. No spam — unsubscribe any time."
                buttonLabel="Unlock free tool details"
                variant="card"
                reloadOnSuccess
              />
            </div>
          )}

          <div className="free-tools-grid">
            {tools.map(tool => (
              <FreeToolCard key={tool.toolName} tool={tool} unlocked={unlocked} />
            ))}
          </div>
        </div>
      </section>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8', padding: '0 2rem 3rem' }}>
        Last updated automatically from our reviews. Tool data is public; detailed analysis is gated behind a free email signup.
      </p>
    </>
  );
}
