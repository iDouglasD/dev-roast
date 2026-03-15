CREATE TYPE "public"."diff_line_type" AS ENUM('added', 'removed', 'context');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'rust', 'ruby', 'php', 'sql', 'html', 'css', 'other');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('needs_serious_help', 'try_harder', 'not_terrible', 'almost_decent', 'mass_respect');--> statement-breakpoint
CREATE TABLE "roast_diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"type" "diff_line_type" NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"severity" "severity" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "language" NOT NULL,
	"line_count" integer NOT NULL,
	"score" real NOT NULL,
	"verdict" "verdict" NOT NULL,
	"roast_comment" text NOT NULL,
	"suggested_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roast_diff_lines" ADD CONSTRAINT "roast_diff_lines_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_issues" ADD CONSTRAINT "roast_issues_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_roasts_leaderboard" ON "roasts" USING btree ("score","created_at");