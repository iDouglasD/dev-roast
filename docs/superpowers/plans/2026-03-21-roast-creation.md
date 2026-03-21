# Roast Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to submit code and receive AI-generated roast analysis (score, verdict, issues, suggested fix with diff).

**Architecture:** Vercel AI SDK (OpenAI provider) generates structured output via `generateObject()`. A tRPC mutation orchestrates the flow: call AI → compute diff → persist to Postgres. The existing result page swaps static mock data for real DB queries.

**Tech Stack:** Vercel AI SDK (`ai` + `@ai-sdk/openai`), `diff` library, tRPC v11, Drizzle ORM, Zod v4

**Spec:** `docs/superpowers/specs/2026-03-21-roast-creation-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|----------------|
| `src/lib/ai/roast-schema.ts` | Zod schema for AI structured output |
| `src/lib/ai/roast-prompt.ts` | System + user prompt builders |
| `src/lib/ai/roast-service.ts` | Orchestration: call AI → compute diff → return data |
| `src/lib/ai/language-map.ts` | Map Shiki language IDs → DB `languageEnum` values |
| `src/trpc/routers/roast.ts` | `roast.create` mutation + `roast.getById` query |

### Modified Files

| File | Change |
|------|--------|
| `src/trpc/routers/_app.ts` | Register `roast` router |
| `src/components/roast-form.tsx` | Wire `useMutation` + redirect + loading/error states |
| `src/app/roast/[id]/page.tsx` | Replace `STATIC_ROAST` with `caller.roast.getById()` + handle variable issue count |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Vercel AI SDK + OpenAI provider + diff library**

```bash
npm install ai @ai-sdk/openai diff
npm install -D @types/diff
```

- [ ] **Step 2: Add `OPENAI_API_KEY` to `.env.local`**

Add the following line to `.env.local` (do NOT commit this file):

```
OPENAI_API_KEY=sk-...your-key-here...
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add ai sdk, openai provider, and diff dependencies"
```

---

## Task 2: Create Language Mapping

**Files:**
- Create: `src/lib/ai/language-map.ts`

The form uses Shiki language IDs (e.g., `"javascript"`, `"bash"`, `"cpp"`) but the DB `languageEnum` has a fixed set of 13 values. Languages not in the enum map to `"other"`.

- [ ] **Step 1: Create `src/lib/ai/language-map.ts`**

```ts
import type { languageEnum } from "@/db/schema";

type DbLanguage = (typeof languageEnum.enumValues)[number];

const SHIKI_TO_DB: Record<string, DbLanguage> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  sql: "sql",
  html: "html",
  css: "css",
};

function toDbLanguage(shikiId: string): DbLanguage {
  return SHIKI_TO_DB[shikiId] ?? "other";
}

export { toDbLanguage, type DbLanguage };
```

- [ ] **Step 2: Run validation**

```bash
npx biome check src/lib/ai/language-map.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/language-map.ts
git commit -m "feat(ai): add shiki-to-db language mapping"
```

---

## Task 3: Create AI Output Schema

**Files:**
- Create: `src/lib/ai/roast-schema.ts`

Zod schema matching the AI structured output. This is passed to `generateObject()` and also used for runtime validation.

- [ ] **Step 1: Create `src/lib/ai/roast-schema.ts`**

```ts
import { z } from "zod";

const roastOutputSchema = z.object({
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Code quality score from 0 (terrible) to 100 (perfect)"),
  verdict: z
    .enum([
      "needs_serious_help",
      "try_harder",
      "not_terrible",
      "almost_decent",
      "mass_respect",
    ])
    .describe("Overall verdict based on score range"),
  roastComment: z
    .string()
    .describe("A memorable one-liner summarizing the code quality"),
  issues: z
    .array(
      z.object({
        severity: z.enum(["critical", "warning", "good"]),
        title: z.string().describe("Short issue title in lowercase"),
        description: z
          .string()
          .describe("Detailed explanation of the issue and how to fix it"),
      }),
    )
    .min(3)
    .max(6)
    .describe("List of issues found in the code"),
  suggestedCode: z
    .string()
    .describe("The improved version of the submitted code with fixes applied"),
});

type RoastOutput = z.infer<typeof roastOutputSchema>;

export { roastOutputSchema, type RoastOutput };
```

- [ ] **Step 2: Run validation**

```bash
npx biome check src/lib/ai/roast-schema.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/roast-schema.ts
git commit -m "feat(ai): add zod schema for ai structured output"
```

---

## Task 4: Create Prompt Templates

**Files:**
- Create: `src/lib/ai/roast-prompt.ts`

System prompt with conditional tone (roast mode vs professional) and user prompt builder.

- [ ] **Step 1: Create `src/lib/ai/roast-prompt.ts`**

```ts
function buildSystemPrompt(roastMode: boolean): string {
  const basePrompt = `You are an expert code reviewer analyzing a code snippet. Your job is to:

1. Evaluate code quality, readability, best practices, and potential bugs.
2. Assign a score from 0 to 100:
   - 0-20: needs_serious_help
   - 21-40: try_harder
   - 41-60: not_terrible
   - 61-80: almost_decent
   - 81-100: mass_respect
3. Choose the verdict that matches the score range above.
4. Generate 3-6 issues. Each issue has a severity:
   - "critical": Bugs, security issues, fundamentally wrong patterns
   - "warning": Code smells, anti-patterns, suboptimal approaches
   - "good": Things the code does well (always include at least 1 if score > 20)
5. Generate a suggestedCode field with the improved version of the code. Apply all fixes from your critical and warning issues. Keep the same language and overall structure.

Issue titles should be lowercase, concise (2-5 words).
Issue descriptions should explain the problem and suggest the fix in 1-2 sentences.`;

  const toneInstruction = roastMode
    ? `\n\nTone: Use acid humor, sarcasm, and programming references. Be brutally honest but funny. The roastComment should be a memorable, cutting one-liner that a developer would screenshot and share. Think "code review from hell" energy. Issue descriptions can be witty but must remain technically accurate.`
    : `\n\nTone: Be direct and professional. Provide constructive feedback without sarcasm. The roastComment should be an objective one-sentence summary of the code quality.`;

  return basePrompt + toneInstruction;
}

function buildUserPrompt(code: string, language: string): string {
  return `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;
}

export { buildSystemPrompt, buildUserPrompt };
```

- [ ] **Step 2: Run validation**

```bash
npx biome check src/lib/ai/roast-prompt.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/roast-prompt.ts
git commit -m "feat(ai): add prompt templates with roast mode toggle"
```

---

## Task 5: Create Roast Service

**Files:**
- Create: `src/lib/ai/roast-service.ts`

Orchestrates the full flow: build prompt → call AI → compute diff → return structured data ready for DB insertion.

- [ ] **Step 1: Create `src/lib/ai/roast-service.ts`**

Reference docs:
- Vercel AI SDK `generateObject()`: uses `ai` package with `@ai-sdk/openai` provider
- `diff` library: `diffLines(oldStr, newStr)` returns array of `Change` objects with `added`, `removed`, `value` properties

```ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { diffLines } from "diff";
import { buildSystemPrompt, buildUserPrompt } from "./roast-prompt";
import { roastOutputSchema, type RoastOutput } from "./roast-schema";

type DiffLine = {
  type: "added" | "removed" | "context";
  content: string;
};

type RoastServiceInput = {
  code: string;
  language: string;
  roastMode: boolean;
};

type RoastServiceOutput = RoastOutput & {
  diffLines: DiffLine[];
};

async function generateRoast(
  input: RoastServiceInput,
): Promise<RoastServiceOutput> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: roastOutputSchema,
    system: buildSystemPrompt(input.roastMode),
    prompt: buildUserPrompt(input.code, input.language),
  });

  const diffLines = computeDiff(input.code, object.suggestedCode);

  return { ...object, diffLines };
}

function computeDiff(original: string, suggested: string): DiffLine[] {
  const changes = diffLines(original, suggested);
  const result: DiffLine[] = [];

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    const type: DiffLine["type"] = change.added
      ? "added"
      : change.removed
        ? "removed"
        : "context";

    for (const line of lines) {
      result.push({ type, content: line });
    }
  }

  return result;
}

export { generateRoast, type RoastServiceInput, type RoastServiceOutput };
```

- [ ] **Step 2: Run validation**

```bash
npx biome check src/lib/ai/roast-service.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/roast-service.ts
git commit -m "feat(ai): add roast service with ai generation and diff computation"
```

---

## Task 6: Create tRPC Roast Router

**Files:**
- Create: `src/trpc/routers/roast.ts`
- Modify: `src/trpc/routers/_app.ts`

Two procedures: `roast.create` (mutation) and `roast.getById` (query).

- [ ] **Step 1: Create `src/trpc/routers/roast.ts`**

```ts
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { roasts, roastIssues, roastDiffLines, languageEnum } from "@/db/schema";
import { generateRoast } from "@/lib/ai/roast-service";
import { toDbLanguage } from "@/lib/ai/language-map";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(1).max(2000),
        language: z.string(),
        roastMode: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generateRoast({
        code: input.code,
        language: input.language,
        roastMode: input.roastMode,
      });

      const dbLanguage = toDbLanguage(input.language);
      const lineCount = input.code.split("\n").length;

      const roast = await ctx.db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(roasts)
          .values({
            code: input.code,
            language: dbLanguage,
            lineCount,
            score: result.score,
            verdict: result.verdict,
            roastComment: result.roastComment,
            suggestedCode: result.suggestedCode,
          })
          .returning({ id: roasts.id });

        if (result.issues.length > 0) {
          await tx.insert(roastIssues).values(
            result.issues.map((issue, index) => ({
              roastId: inserted.id,
              severity: issue.severity,
              title: issue.title,
              description: issue.description,
              sortOrder: index,
            })),
          );
        }

        if (result.diffLines.length > 0) {
          await tx.insert(roastDiffLines).values(
            result.diffLines.map((line, index) => ({
              roastId: inserted.id,
              type: line.type,
              content: line.content,
              sortOrder: index,
            })),
          );
        }

        return inserted;
      });

      return { id: roast.id };
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const roast = await ctx.db
        .select()
        .from(roasts)
        .where(eq(roasts.id, input.id))
        .then((rows) => rows[0]);

      if (!roast) return null;

      const issues = await ctx.db
        .select()
        .from(roastIssues)
        .where(eq(roastIssues.roastId, input.id))
        .orderBy(asc(roastIssues.sortOrder));

      const diffLines = await ctx.db
        .select()
        .from(roastDiffLines)
        .where(eq(roastDiffLines.roastId, input.id))
        .orderBy(asc(roastDiffLines.sortOrder));

      return { ...roast, issues, diffLines };
    }),
});
```

- [ ] **Step 2: Register router in `src/trpc/routers/_app.ts`**

Add the import and register the router:

```ts
import { createTRPCRouter } from "../init";
import { leaderboardRouter } from "./leaderboard";
import { roastRouter } from "./roast";

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  roast: roastRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 3: Run validation**

```bash
npx biome check src/trpc/routers/roast.ts src/trpc/routers/_app.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/trpc/routers/roast.ts src/trpc/routers/_app.ts
git commit -m "feat(trpc): add roast router with create mutation and getById query"
```

---

## Task 7: Wire Form Submission

**Files:**
- Modify: `src/components/roast-form.tsx`

Add `useMutation` for `roast.create`, handle loading/error states, redirect on success.

- [ ] **Step 1: Update `src/components/roast-form.tsx`**

Changes needed:
1. Import `useTRPC` from `@/trpc/client`, `useMutation` from `@tanstack/react-query`, `useRouter` from `next/navigation`
2. Inside `RoastForm`, get the tRPC client and create the mutation
3. Add `handleSubmit` function that calls the mutation with `{ code, language: activeLanguage, roastMode }`
4. On success: `router.push(\`/roast/${data.id}\`)`
5. Wire the `onClick` on the `Button`
6. Disable the entire form during mutation (`isPending` state)
7. Change button text to `"$ roasting..."` when pending

```tsx
// New imports to add:
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";

// Inside RoastForm function, add:
const router = useRouter();
const trpc = useTRPC();
const createRoast = useMutation(trpc.roast.create.mutationOptions());

const handleSubmit = () => {
  createRoast.mutate(
    { code, language: activeLanguage, roastMode },
    { onSuccess: (data) => router.push(`/roast/${data.id}`) },
  );
};

const isSubmitting = createRoast.isPending;

// Update Button:
// - Add onClick={handleSubmit}
// - Add isSubmitting to disabled condition
// - Change text conditionally: isSubmitting ? "$ roasting..." : "$ roast_my_code"

// Update CodeEditor, LanguageSelector, Toggle:
// - Add disabled={isSubmitting} to each (pass through props)

// Add error display after the actions bar:
// {createRoast.isError && (
//   <p className="font-mono text-xs text-accent-red">
//     {"// error: failed to generate roast. try again."}
//   </p>
// )}
```

- [ ] **Step 2: Run validation**

```bash
npx biome check src/components/roast-form.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/roast-form.tsx
git commit -m "feat(form): wire roast creation mutation with loading and error states"
```

---

## Task 8: Connect Result Page to Database

**Files:**
- Modify: `src/app/roast/[id]/page.tsx`

Replace static mock with real DB query. Handle missing roast (404). Handle variable issue count.

- [ ] **Step 1: Update `src/app/roast/[id]/page.tsx`**

Changes needed:
1. Remove `STATIC_ROAST` constant entirely
2. Import `caller` from `@/trpc/server` and `notFound` from `next/navigation`
3. Fetch data: `const roast = await caller.roast.getById({ id })`
4. If `!roast`, call `notFound()`
5. Replace the hardcoded 2-row issue layout (`slice(0,2)` + `slice(2,4)`) with a single grid that handles 3-6 issues dynamically:

```tsx
<div className="grid grid-cols-2 gap-5">
  {roast.issues.map((issue) => (
    <AnalysisCard key={issue.id}>
      <Badge variant={issue.severity}>{issue.severity}</Badge>
      <AnalysisCard.Title>{issue.title}</AnalysisCard.Title>
      <AnalysisCard.Description>{issue.description}</AnalysisCard.Description>
    </AnalysisCard>
  ))}
</div>
```

6. Update the diff header to use the actual language instead of hardcoded `.ts`
7. Remove `void id;` suppression line

- [ ] **Step 2: Run validation**

```bash
npx biome check src/app/roast/[id]/page.tsx && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/roast/[id]/page.tsx
git commit -m "feat(results): connect roast result page to database"
```

---

## Task 9: Manual End-to-End Test

No automated test framework is configured. Verify the full flow manually.

- [ ] **Step 1: Ensure DB is running**

```bash
npm run db:up
```

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Test the happy path**

1. Open `http://localhost:3000`
2. Paste a code snippet (e.g., a function with obvious issues)
3. Toggle roast mode on
4. Click "$ roast_my_code"
5. Verify button shows "$ roasting..." and form is disabled
6. After ~5-10s, verify redirect to `/roast/<uuid>`
7. Verify: score ring, verdict badge, roast comment, issues (3-6), diff viewer all render correctly

- [ ] **Step 4: Test roast mode off**

Repeat with roast mode toggled off. Verify the tone is professional (no sarcasm in roastComment and issue descriptions).

- [ ] **Step 5: Test edge cases**

- Empty code → button should be disabled
- Code > 2000 chars → button should be disabled
- Invalid roast ID in URL → should show 404 page

- [ ] **Step 6: Verify leaderboard still works**

Navigate to `/leaderboard` — the new roast should appear in the list.

- [ ] **Step 7: Run full build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 8: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address issues found during e2e testing"
```
