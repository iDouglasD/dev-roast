import {
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────

export const severityEnum = pgEnum("severity", ["critical", "warning", "good"]);

export const verdictEnum = pgEnum("verdict", [
  "needs_serious_help",
  "try_harder",
  "not_terrible",
  "almost_decent",
  "mass_respect",
]);

export const diffLineTypeEnum = pgEnum("diff_line_type", [
  "added",
  "removed",
  "context",
]);

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "sql",
  "html",
  "css",
  "other",
]);

// ── Tables ─────────────────────────────────────────────

export const roasts = pgTable(
  "roasts",
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull(),
    language: languageEnum().notNull(),
    lineCount: integer().notNull(),
    score: real().notNull(),
    verdict: verdictEnum().notNull(),
    roastComment: text().notNull(),
    suggestedCode: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_roasts_leaderboard").on(t.score, t.createdAt)],
);

export const roastIssues = pgTable("roast_issues", {
  id: uuid().primaryKey().defaultRandom(),
  roastId: uuid()
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),
  severity: severityEnum().notNull(),
  title: text().notNull(),
  description: text().notNull(),
  sortOrder: integer().notNull().default(0),
});

export const roastDiffLines = pgTable("roast_diff_lines", {
  id: uuid().primaryKey().defaultRandom(),
  roastId: uuid()
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),
  type: diffLineTypeEnum().notNull(),
  content: text().notNull(),
  sortOrder: integer().notNull(),
});
