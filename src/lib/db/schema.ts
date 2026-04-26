import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Key/value store for app-wide singletons.
 *  - "active_stream_id" → the id of the currently active Stream
 */
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Business streams — one row per AI Digital Streams revenue stream. */
export const streams = pgTable('streams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  tagline: text('tagline').notNull().default(''),
  domain: text('domain').notNull().default(''),
  /** Postgres text[] of content folder names (reviews, comparisons, …). */
  contentDirs: text('content_dirs').array().notNull().default([]),
  /** active | planned | archived */
  status: text('status').notNull().default('planned'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Affiliate programs we've applied for or are running. */
export const affiliates = pgTable(
  'affiliates',
  {
    id: text('id').primaryKey(),
    streamId: text('stream_id').notNull().references(() => streams.id, { onDelete: 'cascade' }),
    toolName: text('tool_name').notNull(),
    commissionRate: text('commission_rate').notNull().default(''),
    cookieDuration: text('cookie_duration').notNull().default(''),
    signupUrl: text('signup_url').notNull().default(''),
    /** active | pending | rejected | paused */
    status: text('status').notNull().default('pending'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    affiliatesStreamIdx: index('affiliates_stream_idx').on(table.streamId),
    affiliatesStatusIdx: index('affiliates_status_idx').on(table.status),
  }),
);

/** Manual revenue entries until affiliate APIs are wired up. */
export const revenueEntries = pgTable(
  'revenue_entries',
  {
    id: text('id').primaryKey(),
    streamId: text('stream_id').notNull().references(() => streams.id, { onDelete: 'cascade' }),
    /** ISO date YYYY-MM-DD — kept as text for historical-import compatibility. */
    date: text('date').notNull(),
    toolName: text('tool_name').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('GBP'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    revenueStreamIdx: index('revenue_stream_idx').on(table.streamId),
    revenueDateIdx: index('revenue_date_idx').on(table.date),
  }),
);

/** Research Hub notes. */
export const researchNotes = pgTable(
  'research_notes',
  {
    id: text('id').primaryKey(),
    streamId: text('stream_id').notNull().references(() => streams.id, { onDelete: 'cascade' }),
    /** market-brief | competitor-watch | new-tool | trend | note */
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    source: text('source'),
    /** open | actioned | archived */
    status: text('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    researchStreamIdx: index('research_stream_idx').on(table.streamId),
    researchStatusIdx: index('research_status_idx').on(table.status),
  }),
);

/** Newsletter drafts + sent newsletters. */
export const newsletters = pgTable(
  'newsletters',
  {
    id: text('id').primaryKey(),
    streamId: text('stream_id').notNull().references(() => streams.id, { onDelete: 'cascade' }),
    subject: text('subject').notNull(),
    body: text('body').notNull().default(''),
    preview: text('preview'),
    /** draft | scheduled | sent */
    status: text('status').notNull().default('draft'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    recipientCount: integer('recipient_count'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    newslettersStreamIdx: index('newsletters_stream_idx').on(table.streamId),
    newslettersStatusIdx: index('newsletters_status_idx').on(table.status),
  }),
);

/** Email subscribers from the comparison builder + free tools gate + newsletter form. */
export const subscribers = pgTable(
  'subscribers',
  {
    id: text('id').primaryKey(),
    streamId: text('stream_id').notNull().references(() => streams.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    /** comparison-builder | free-tools | newsletter | other */
    source: text('source').notNull(),
    /** active | unsubscribed */
    status: text('status').notNull().default('active'),
    context: text('context'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  },
  table => ({
    subscribersStreamEmailUnique: uniqueIndex('subscribers_stream_email_idx').on(table.streamId, table.email),
    subscribersSourceIdx: index('subscribers_source_idx').on(table.source),
    subscribersStatusIdx: index('subscribers_status_idx').on(table.status),
  }),
);

/** Append-only operations log driving /admin/activity and the dashboard recent-activity widget. */
export const activityEntries = pgTable(
  'activity_entries',
  {
    id: text('id').primaryKey(),
    streamId: text('stream_id'),
    /** See ActivityKind in src/lib/activity.ts */
    kind: text('kind').notNull(),
    subject: text('subject').notNull(),
    detail: text('detail'),
    href: text('href'),
    at: timestamp('at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    activityStreamIdx: index('activity_stream_idx').on(table.streamId),
    activityAtIdx: index('activity_at_idx').on(table.at),
    activityKindIdx: index('activity_kind_idx').on(table.kind),
  }),
);

// Inferred row types for app code.
export type AppSetting = typeof appSettings.$inferSelect;
export type Stream = typeof streams.$inferSelect;
export type NewStream = typeof streams.$inferInsert;
export type Affiliate = typeof affiliates.$inferSelect;
export type NewAffiliate = typeof affiliates.$inferInsert;
export type RevenueEntry = typeof revenueEntries.$inferSelect;
export type NewRevenueEntry = typeof revenueEntries.$inferInsert;
export type ResearchNote = typeof researchNotes.$inferSelect;
export type NewResearchNote = typeof researchNotes.$inferInsert;
export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type ActivityEntry = typeof activityEntries.$inferSelect;
export type NewActivityEntry = typeof activityEntries.$inferInsert;
