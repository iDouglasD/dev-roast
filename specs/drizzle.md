# Drizzle ORM — Implementation Spec

> Data layer for Dev Roast: PostgreSQL + Drizzle ORM + Docker Compose.

---

## 1. Overview

Dev Roast needs a persistence layer to store code submissions, AI-generated roasts (score, analysis, diff), and serve the Shame Leaderboard. This spec covers:

- Docker Compose setup for PostgreSQL
- Drizzle ORM schema (tables, enums, indexes)
- Database connection and config
- Migration workflow
- Implementation to-dos

---

## 2. Stack Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Database | PostgreSQL 16 | Robust, great JSON support, native enums |
| ORM | Drizzle ORM | Type-safe, zero abstraction penalty, SQL-like API |
| Migrations | `drizzle-kit` | Built-in migration tool for Drizzle |
| AI | Vercel AI SDK | Flexible multi-provider support (OpenAI, Anthropic, Gemini) |
| Auth | None | Anonymous submissions — no user accounts |
| Container | Docker Compose | Local dev Postgres with zero config |

---

## 3. Docker Compose

File: `docker-compose.yml` (project root)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Environment variable (`.env`):

```env
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## 4. Enums

Derived from the design file (Screen 2 — Roast Results).

### `severity`

Used in analysis issues (the analysis cards). Maps directly to the `Badge` component variants.

| Value | Design Reference | Color Token |
|---|---|---|
| `critical` | Red dot + "critical" label | `$accent-red` |
| `warning` | Amber dot + "warning" label | `$accent-amber` |
| `good` | Green dot + "good" label | `$accent-green` |

### `verdict`

The overall verdict shown in the roast badge and OG image. Derived from the score.

| Value | Score Range | Design Reference |
|---|---|---|
| `needs_serious_help` | 0.0–3.0 | Red badge, Screen 2 + OG |
| `try_harder` | 3.1–5.0 | Amber badge |
| `not_terrible` | 5.1–7.0 | Amber/neutral |
| `almost_decent` | 7.1–8.5 | Green-ish |
| `mass_respect` | 8.6–10.0 | Green badge |

### `diff_line_type`

Used in the suggested fix diff view. Maps to `DiffLine` component variants.

| Value | Design Reference |
|---|---|
| `added` | Green background, `+` prefix |
| `removed` | Red background, `-` prefix |
| `context` | No background, ` ` prefix |

### `language`

Supported programming languages for code submissions. Shown in the leaderboard meta and roast meta.

| Value |
|---|
| `javascript` |
| `typescript` |
| `python` |
| `java` |
| `csharp` |
| `go` |
| `rust` |
| `ruby` |
| `php` |
| `sql` |
| `html` |
| `css` |
| `other` |

---

## 5. Tables

### 5.1 `roasts`

The core table. One row per code submission + AI roast result.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Unique roast ID |
| `code` | `text` | NOT NULL | Submitted code snippet |
| `language` | `language` enum | NOT NULL | Programming language |
| `line_count` | `integer` | NOT NULL | Number of lines in submitted code |
| `score` | `real` | NOT NULL | Roast score 0.0–10.0 |
| `verdict` | `verdict` enum | NOT NULL | Derived verdict label |
| `roast_comment` | `text` | NOT NULL | The savage one-liner quote (e.g., "this code looks like it was written during a power outage...") |
| `suggested_code` | `text` | NULL | The improved version of the code (for diff view) |
| `created_at` | `timestamp` | NOT NULL, `now()` | Submission timestamp |

**Indexes:**
- `idx_roasts_score` — `(score ASC)` for leaderboard ranking (worst first)
- `idx_roasts_created_at` — `(created_at DESC)` for time-based filtering
- `idx_roasts_score_created_at` — `(score ASC, created_at DESC)` composite for filtered leaderboard queries

### 5.2 `roast_issues`

Analysis cards from the detailed analysis section. One roast has many issues.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Issue ID |
| `roast_id` | `uuid` | FK → `roasts.id`, ON DELETE CASCADE | Parent roast |
| `severity` | `severity` enum | NOT NULL | `critical` / `warning` / `good` |
| `title` | `text` | NOT NULL | Short issue title (e.g., "using var instead of const/let") |
| `description` | `text` | NOT NULL | Detailed explanation |
| `sort_order` | `integer` | NOT NULL, default `0` | Display order in the grid |

**Indexes:**
- `idx_roast_issues_roast_id` — `(roast_id)` for fetching issues by roast

### 5.3 `roast_diff_lines`

Individual lines of the suggested fix diff. One roast has many diff lines.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Diff line ID |
| `roast_id` | `uuid` | FK → `roasts.id`, ON DELETE CASCADE | Parent roast |
| `type` | `diff_line_type` enum | NOT NULL | `added` / `removed` / `context` |
| `content` | `text` | NOT NULL | The line of code |
| `sort_order` | `integer` | NOT NULL | Line position in the diff |

**Indexes:**
- `idx_roast_diff_lines_roast_id` — `(roast_id)` for fetching diff by roast

---

## 6. Entity Relationship Diagram

```
┌─────────────────────────┐
│         roasts           │
├─────────────────────────┤
│ id          (uuid) PK    │
│ code        (text)       │
│ language    (enum)       │
│ line_count  (integer)    │
│ score       (real)       │
│ verdict     (enum)       │
│ roast_comment (text)     │
│ suggested_code (text)    │
│ created_at  (timestamp)  │
└──────────┬──────────────┘
           │ 1
           │
     ┌─────┴──────┐
     │             │
     │ N           │ N
┌────▼──────┐ ┌───▼────────────┐
│roast_issues│ │roast_diff_lines│
├───────────┤ ├────────────────┤
│ id    (PK)│ │ id        (PK) │
│ roast_id  │ │ roast_id       │
│ severity  │ │ type           │
│ title     │ │ content        │
│ description│ │ sort_order     │
│ sort_order│ └────────────────┘
└───────────┘
```

---

## 7. Drizzle Schema

File: `src/db/schema.ts`

```typescript
import { pgTable, pgEnum, uuid, text, real, integer, timestamp } from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────

export const severityEnum = pgEnum("severity", [
  "critical",
  "warning",
  "good",
]);

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

export const roasts = pgTable("roasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  language: languageEnum("language").notNull(),
  lineCount: integer("line_count").notNull(),
  score: real("score").notNull(),
  verdict: verdictEnum("verdict").notNull(),
  roastComment: text("roast_comment").notNull(),
  suggestedCode: text("suggested_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const roastIssues = pgTable("roast_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  roastId: uuid("roast_id")
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),
  severity: severityEnum("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const roastDiffLines = pgTable("roast_diff_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  roastId: uuid("roast_id")
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),
  type: diffLineTypeEnum("type").notNull(),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull(),
});
```

---

## 8. Drizzle Config

File: `drizzle.config.ts` (project root)

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 9. Database Connection

File: `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

---

## 10. Drizzle Relations (Optional but Recommended)

File: `src/db/relations.ts`

```typescript
import { relations } from "drizzle-orm";
import { roasts, roastIssues, roastDiffLines } from "./schema";

export const roastsRelations = relations(roasts, ({ many }) => ({
  issues: many(roastIssues),
  diffLines: many(roastDiffLines),
}));

export const roastIssuesRelations = relations(roastIssues, ({ one }) => ({
  roast: one(roasts, {
    fields: [roastIssues.roastId],
    references: [roasts.id],
  }),
}));

export const roastDiffLinesRelations = relations(roastDiffLines, ({ one }) => ({
  roast: one(roasts, {
    fields: [roastDiffLines.roastId],
    references: [roasts.id],
  }),
}));
```

---

## 11. Key Queries (Reference)

### Insert a roast (with issues + diff in transaction)

```typescript
const result = await db.transaction(async (tx) => {
  const [roast] = await tx.insert(roasts).values({ ... }).returning();

  await tx.insert(roastIssues).values(
    issues.map((issue, i) => ({ ...issue, roastId: roast.id, sortOrder: i }))
  );

  await tx.insert(roastDiffLines).values(
    diffLines.map((line, i) => ({ ...line, roastId: roast.id, sortOrder: i }))
  );

  return roast;
});
```

### Fetch roast by ID (with relations)

```typescript
const roast = await db.query.roasts.findFirst({
  where: eq(roasts.id, id),
  with: {
    issues: { orderBy: [asc(roastIssues.sortOrder)] },
    diffLines: { orderBy: [asc(roastDiffLines.sortOrder)] },
  },
});
```

### Leaderboard — all time (worst first)

```typescript
const entries = await db.query.roasts.findMany({
  orderBy: [asc(roasts.score), desc(roasts.createdAt)],
  limit: 50,
});
```

### Leaderboard — time-filtered

```typescript
const entries = await db.query.roasts.findMany({
  where: gte(roasts.createdAt, startDate),
  orderBy: [asc(roasts.score), desc(roasts.createdAt)],
  limit: 50,
});
```

### Aggregate stats (for header)

```typescript
const [stats] = await db
  .select({
    totalSubmissions: count(),
    avgScore: avg(roasts.score),
  })
  .from(roasts);
```

---

## 12. File Structure (Final)

```
dev-roast/
├── docker-compose.yml          # Postgres container
├── drizzle.config.ts           # Drizzle Kit config
├── drizzle/                    # Generated migrations (auto)
├── .env                        # DATABASE_URL
├── src/
│   └── db/
│       ├── index.ts            # Database connection (drizzle instance)
│       ├── schema.ts           # Tables + enums
│       └── relations.ts        # Drizzle relations
```

---

## 13. Implementation To-Dos

### Infrastructure

- [ ] Create `docker-compose.yml` with Postgres 16
- [ ] Create `.env` with `DATABASE_URL`
- [ ] Add `.env` to `.gitignore`
- [ ] Install dependencies: `drizzle-orm`, `pg`, `@types/pg`
- [ ] Install dev dependencies: `drizzle-kit`
- [ ] Create `drizzle.config.ts`

### Schema

- [ ] Create `src/db/schema.ts` with all enums and tables
- [ ] Create `src/db/relations.ts` with Drizzle relations
- [ ] Create `src/db/index.ts` with database connection
- [ ] Run `npx drizzle-kit generate` to create initial migration
- [ ] Run `npx drizzle-kit migrate` to apply migration
- [ ] Verify tables in database with `npx drizzle-kit studio`

### Scripts (package.json)

- [ ] Add `"db:generate": "drizzle-kit generate"`
- [ ] Add `"db:migrate": "drizzle-kit migrate"`
- [ ] Add `"db:studio": "drizzle-kit studio"`
- [ ] Add `"db:up": "docker compose up -d"`
- [ ] Add `"db:down": "docker compose down"`

### Validation

- [ ] Start Postgres with `npm run db:up`
- [ ] Generate and apply migration
- [ ] Open Drizzle Studio and verify tables, enums, and indexes
- [ ] Test a manual insert/select cycle

---

## 14. Design ↔ Schema Mapping

How the schema maps to each screen from the Pencil design file:

| Screen | Data Source | Query |
|---|---|---|
| **Screen 1** (Code Input) | None (input only) | — |
| **Screen 2** (Roast Results) | `roasts` + `roast_issues` + `roast_diff_lines` | Fetch by ID with relations |
| **Screen 3** (Shame Leaderboard) | `roasts` (list) | Ordered by score ASC, time-filtered |
| **Screen 4** (OG Image) | `roasts` (single) | Fetch by ID (score, verdict, language, roast_comment) |

### Screen 2 — Roast Results field mapping

| UI Element | Source |
|---|---|
| Score Ring (3.5) | `roasts.score` |
| Verdict badge ("needs_serious_help") | `roasts.verdict` |
| Roast quote ("this code looks like...") | `roasts.roast_comment` |
| Meta: language | `roasts.language` |
| Meta: line count | `roasts.line_count` |
| Submitted code block | `roasts.code` |
| Analysis cards (4 cards in grid) | `roast_issues` rows ordered by `sort_order` |
| Analysis card severity dot + label | `roast_issues.severity` |
| Analysis card title | `roast_issues.title` |
| Analysis card description | `roast_issues.description` |
| Diff header filename | Derived from `roasts.language` |
| Diff lines | `roast_diff_lines` rows ordered by `sort_order` |

### Screen 3 — Leaderboard field mapping

| UI Element | Source |
|---|---|
| Title stats ("2,847 submissions") | `COUNT(*)` aggregate |
| Average score ("avg score: 4.2/10") | `AVG(score)` aggregate |
| Entry rank (#1, #2, ...) | Row number from ordered query |
| Entry score (1.2, 1.8, ...) | `roasts.score` |
| Entry language ("javascript") | `roasts.language` |
| Entry line count ("3 lines") | `roasts.line_count` |
| Entry code preview | `roasts.code` (truncated) |

### Screen 4 — OG Image field mapping

| UI Element | Source |
|---|---|
| Score number (3.5) | `roasts.score` |
| Verdict text ("needs_serious_help") | `roasts.verdict` |
| Language + lines | `roasts.language`, `roasts.line_count` |
| Roast quote | `roasts.roast_comment` |
