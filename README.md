# Dev Roast

> Get your code brutally roasted by AI.

Dev Roast is a web app that analyzes your code and delivers a savage, entertaining roast — complete with a score, detailed analysis, and suggested fixes. Think of it as a code review, but meaner.

## Features

- **Paste & Roast** — Drop your code into a terminal-style editor and get an instant AI-powered roast
- **Score Ring** — A circular score from 0-100 showing how bad (or good) your code really is
- **Detailed Analysis** — Categorized feedback cards covering readability, performance, best practices, and more
- **Diff Suggestions** — See exactly what should change with color-coded added/removed lines
- **Shame Leaderboard** — The worst code submissions ranked for all to see
- **OG Image** — Shareable social card so you can flex (or hide) your score

## Screens

1. **Homepage** — Terminal-themed code input with language toggle and "Roast my code" button
2. **Roast Results** — Score hero, submitted code, analysis cards grid, and suggested fixes
3. **Shame Leaderboard** — Hall of shame with ranked entries and code previews
4. **OG Image** — Auto-generated social sharing card

## Built With

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) v4 + [tailwind-variants](https://www.tailwind-variants.org)
- [tRPC](https://trpc.io) v11 + [TanStack Query](https://tanstack.com/query) v5
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL 16
- [Base UI](https://base-ui.com) (headless primitives)
- [Shiki](https://shiki.style) (syntax highlighting)
- [Vercel AI SDK](https://sdk.vercel.ai) (Google Gemini / OpenAI)
- [Biome](https://biomejs.dev) (lint + format)

## How It Was Built

This project is being built using an AI-assisted design-to-code workflow:

- **Design** — Created in [Pencil](https://pencil.co) and served as the single source of truth via MCP (Model Context Protocol)
- **Code** — Generated and iterated with [Claude Code](https://docs.anthropic.com/en/docs/claude-code), powered by Claude Opus 4.6
- **Skills** — Extended with [SuperPowers](https://github.com/pashpashpash/claude-code-superpowers) skills for structured brainstorming, planning, TDD, debugging, and code review workflows
- **E2E testing** — Validated with Playwright via MCP for browser-based testing
- **Every component, token, and layout decision** traces back to the Pencil design file — no guesswork, no approximations

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### Setup

```bash
# Install dependencies
npm install

# Start the database
npm run db:up

# Create a .env file with your keys
cp .env.example .env
# Edit .env with your API keys (GOOGLE_GENERATIVE_AI_API_KEY, DATABASE_URL)

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Run Biome checks |
| `npm run format` | Auto-format with Biome |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with sample data |

## License

[MIT](LICENSE)
