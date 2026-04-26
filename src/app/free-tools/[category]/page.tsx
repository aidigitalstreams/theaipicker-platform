import Link from 'next/link';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import FreeToolCard from '@/components/FreeToolCard';
import EmailCaptureForm from '@/components/EmailCaptureForm';
import {
  getFreeToolCategories,
  getFreeToolsByCategorySlug,
} from '@/lib/free-tools';

interface Props {
  params: Promise<{ category: string }>;
}

const FREE_TOOLS_COOKIE = 'aids_free_unlocked';

export async function generateStaticParams() {
  const cats = await getFreeToolCategories();
  return cats.map(c => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getFreeToolsByCategorySlug(category);
  if (!cat) return {};
  return {
    title: `Best Free ${cat.name} — Researched & Ranked`,
    description: `${cat.count} free ${cat.name.toLowerCase()} ranked by overall score across five weighted factors. Honest research, transparent methodology.`,
  };
}

export default async function FreeToolsCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = await getFreeToolsByCategorySlug(category);
  if (!cat) notFound();

  const allCats = await getFreeToolCategories();
  const cookieStore = await cookies();
  const unlocked = cookieStore.get(FREE_TOOLS_COOKIE)?.value === '1';

  return (
    <>
      <PageHero
        label="FREE TOOLS"
        title={`Best Free ${cat.name}`}
        subtitle={`${cat.count} ${cat.name.toLowerCase()} with usable free plans, ranked by overall score. Average score ${cat.averageScore}/100.`}
      />

      <section style={{ background: '#FFFFFF', padding: '4rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="free-tools-categories">
            <Link href="/free-tools" className="free-tools-category-pill">
              ← All free tools
            </Link>
            {allCats.filter(c => c.slug !== cat.slug).map(c => (
              <Link key={c.slug} href={`/free-tools/${c.slug}`} className="free-tools-category-pill">
                {c.name} <span>{c.count}</span>
              </Link>
            ))}
          </div>

          {!unlocked && (
            <div className="free-tools-gate-banner">
              <EmailCaptureForm
                source="free-tools"
                context={cat.name}
                heading="Unlock the full breakdown"
                description={`Tool names, scores, and best-for lines stay public. Drop your email to unlock factor breakdowns, free-plan limits, and verdicts for every ${cat.name.toLowerCase().replace(/s$/, '')} below.`}
                buttonLabel="Unlock free tool details"
                variant="card"
                reloadOnSuccess
              />
            </div>
          )}

          <div className="free-tools-grid">
            {cat.tools.map(tool => (
              <FreeToolCard key={tool.toolName} tool={tool} unlocked={unlocked} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
