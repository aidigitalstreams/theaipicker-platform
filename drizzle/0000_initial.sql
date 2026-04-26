CREATE TABLE "action_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'other' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "activity_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"stream_id" text,
	"kind" text NOT NULL,
	"subject" text NOT NULL,
	"detail" text,
	"href" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"stream_id" text NOT NULL,
	"tool_name" text NOT NULL,
	"commission_rate" text DEFAULT '' NOT NULL,
	"cookie_duration" text DEFAULT '' NOT NULL,
	"signup_url" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bridge_heartbeat" (
	"id" serial PRIMARY KEY NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"machine_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"reasoning" text DEFAULT '' NOT NULL,
	"outcome" text,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"category" text,
	"instructions" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"execution_order" integer DEFAULT 0 NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_date" timestamp with time zone,
	"result_notes" text
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL,
	"started_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"notes" text,
	"depends_on" integer
);
--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"keyword" text NOT NULL,
	"search_volume" integer,
	"difficulty" integer,
	"intent" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"target_article" text,
	"current_ranking" integer,
	"status" text DEFAULT 'open' NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" text PRIMARY KEY NOT NULL,
	"stream_id" text NOT NULL,
	"subject" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"preview" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"recipient_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"stream_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"source" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"stream_id" text NOT NULL,
	"date" text NOT NULL,
	"tool_name" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'GBP' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"domain" text DEFAULT '' NOT NULL,
	"content_dirs" text[] DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"stream_id" text NOT NULL,
	"email" text NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"context" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_notes" ADD CONSTRAINT "research_notes_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "action_queue_status_idx" ON "action_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "action_queue_priority_idx" ON "action_queue" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "activity_stream_idx" ON "activity_entries" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "activity_at_idx" ON "activity_entries" USING btree ("at");--> statement-breakpoint
CREATE INDEX "activity_kind_idx" ON "activity_entries" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "affiliates_stream_idx" ON "affiliates" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "affiliates_status_idx" ON "affiliates" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "bridge_heartbeat_machine_idx" ON "bridge_heartbeat" USING btree ("machine_name");--> statement-breakpoint
CREATE INDEX "bridge_heartbeat_last_seen_idx" ON "bridge_heartbeat" USING btree ("last_seen");--> statement-breakpoint
CREATE INDEX "decisions_created_idx" ON "decisions" USING btree ("created_date");--> statement-breakpoint
CREATE INDEX "inbox_status_idx" ON "inbox" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inbox_order_idx" ON "inbox" USING btree ("execution_order");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_priority_idx" ON "jobs" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "jobs_depends_on_idx" ON "jobs" USING btree ("depends_on");--> statement-breakpoint
CREATE UNIQUE INDEX "keywords_keyword_idx" ON "keywords" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "keywords_status_idx" ON "keywords" USING btree ("status");--> statement-breakpoint
CREATE INDEX "keywords_priority_idx" ON "keywords" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "newsletters_stream_idx" ON "newsletters" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "newsletters_status_idx" ON "newsletters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "research_stream_idx" ON "research_notes" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "research_status_idx" ON "research_notes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "revenue_stream_idx" ON "revenue_entries" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "revenue_date_idx" ON "revenue_entries" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_stream_email_idx" ON "subscribers" USING btree ("stream_id","email");--> statement-breakpoint
CREATE INDEX "subscribers_source_idx" ON "subscribers" USING btree ("source");--> statement-breakpoint
CREATE INDEX "subscribers_status_idx" ON "subscribers" USING btree ("status");