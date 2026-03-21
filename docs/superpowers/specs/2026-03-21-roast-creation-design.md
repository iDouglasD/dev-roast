# Roast Creation — Design Spec

AI-powered code analysis feature. Users paste code, get a roast (score, verdict, issues, suggested improvements).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM integration | Vercel AI SDK + OpenAI (GPT) | Multi-provider abstraction, native structured output support |
| UX flow | Form → redirect → loading → result | Leverages existing `/roast/[id]` page, clean user flow |
| Backend pattern | tRPC mutation (synchronous) | Single API pattern, type-safety end-to-end, consistent with project |
| Roast mode | Controls tone only | Keeps technical analysis consistent; sarcastic vs professional text |
| Diff generation | Programmatic (code vs suggestedCode) | LLMs are unreliable at generating formatted diffs |
| Architecture | tRPC end-to-end | One API pattern for the whole project (no route handlers or server actions) |

## Architecture

### New Files

```
src/
├── lib/
│   └── ai/
│       ├── roast-service.ts   # Orchestrates: call AI → compute diff → return structured data
│       ├── roast-prompt.ts    # Prompt templates (base + conditional tone)
│       └── roast-schema.ts    # Zod schema for AI structured output
└── trpc/
    └── routers/
        └── roast.ts           # roast.create mutation + roast.getById query
```

### Modified Files

| File | Change |
|------|--------|
| `src/trpc/routers/_app.ts` | Register `roast` router |
| `src/components/roast-form.tsx` | Wire submit handler with `useMutation` + redirect |
| `src/app/roast/[id]/page.tsx` | Replace static mock with `caller.roast.getById()` |

### New Dependencies

| Package | Purpose |
|---------|---------|
| `ai` | Vercel AI SDK core |
| `@ai-sdk/openai` | OpenAI provider for Vercel AI SDK |
| `diff` | Programmatic diff computation (code vs suggestedCode) |

## Service Layer — `roast-service.ts`

Orchestration function that:

1. Receives `{ code, language, roastMode }`
2. Builds prompt (base + tone instruction based on `roastMode`)
3. Calls `generateObject()` from Vercel AI SDK with Zod schema
4. Receives: `{ score, verdict, roastComment, issues[], suggestedCode }`
5. Computes diff programmatically (original code vs `suggestedCode`)
6. Returns everything structured and ready to persist

### AI Output Schema (Zod)

```ts
{
  score: z.number().int().min(0).max(100),
  verdict: z.enum([
    "needs_serious_help",
    "try_harder",
    "not_terrible",
    "almost_decent",
    "mass_respect",
  ]),
  roastComment: z.string(),
  issues: z.array(z.object({
    severity: z.enum(["critical", "warning", "good"]),
    title: z.string(),
    description: z.string(),
  })),
  suggestedCode: z.string(),
}
```

## tRPC Router — `roast.ts`

### `roast.create` (mutation)

- **Input:** `{ code: string, language: LanguageEnum, roastMode: boolean }`
- **Validation:** code not empty, max 2000 chars (matches CodeEditor limit)
- **Flow:** call `roastService` → insert `roast` → batch insert `roastIssues` → batch insert `roastDiffLines` → return `{ id }`
- **All inserts in a single transaction** for consistency (rollback on failure)

### `roast.getById` (query)

- **Input:** `{ id: string (uuid) }`
- **Returns:** roast + issues (ordered by sortOrder) + diffLines (ordered by sortOrder)
- **Used server-side** in `/roast/[id]` page

## Client Flow — Form Submit + Redirect

Changes to existing `RoastForm` component:

1. Submit button calls `roast.create` via `useMutation()`
2. During mutation (~5-10s):
   - Button disabled with "Roasting..." text + spinner/animation
   - Entire form disabled (textarea, language selector, toggle)
3. On success: `router.push(/roast/${id})`
4. On error: display error message, re-enable form

No new components — only wiring in the existing `RoastForm`.

## Result Page — `/roast/[id]`

Changes to existing page:

1. Remove `STATIC_ROAST` mock data
2. Fetch real data via `caller.roast.getById({ id: params.id })` server-side
3. Return `notFound()` if roast doesn't exist
4. UI components already built — just swap data source

No visual changes.

## Prompt Engineering — `roast-prompt.ts`

### System Prompt (base)

Defines the role: experienced code reviewer that analyzes code snippets. Instructs the AI to:

- Evaluate quality, readability, best practices, potential bugs
- Return score 0-100 (0 = terrible, 100 = perfect)
- Choose verdict based on score range
- Generate 3-6 issues with appropriate severity
- Always include at least 1 "good" issue when code isn't terrible
- Generate `suggestedCode` with improvements applied

### Conditional Tone Instruction

- `roastMode: true` — Acid humor, sarcasm, programming references. Brutally honest but funny. Memorable, cutting roastComment.
- `roastMode: false` — Direct and professional. Constructive feedback without sarcasm. Objective summary as roastComment.

### User Prompt

The code itself, with the identified language as context.

## Out of Scope

- Share roast functionality
- Rate limiting / abuse prevention
- Prompt fine-tuning (will iterate manually)
- Authentication
- Caching of AI responses
