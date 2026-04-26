import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type DbClient = NeonHttpDatabase<typeof schema>;

let cached: DbClient | undefined;

/**
 * Returns a Drizzle client backed by the Neon HTTP serverless driver.
 * Lazy-initialises so the module can be imported during builds without
 * DATABASE_URL set — failures only happen if a query actually runs.
 */
export function getDb(): DbClient {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Configure it in Vercel env vars (already done) or .env.local for local dev.',
    );
  }
  const sql = neon(url);
  cached = drizzle(sql, { schema });
  return cached;
}

export { schema };
export type {
  AppSetting,
  Stream,
  NewStream,
  Affiliate,
  NewAffiliate,
  RevenueEntry,
  NewRevenueEntry,
  ResearchNote,
  NewResearchNote,
  Newsletter,
  NewNewsletter,
  Subscriber,
  NewSubscriber,
  ActivityEntry,
  NewActivityEntry,
} from './schema';
