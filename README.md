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

- [Next.js](https://nextjs.org) 16 (App Router)
- [Tailwind CSS](https://tailwindcss.com) v4
- [TypeScript](https://www.typescriptlang.org)
- [Shiki](https://shiki.style) for syntax highlighting
- [Biome](https://biomejs.dev) for linting and formatting

## How It Was Built

This project is being built using an AI-assisted design-to-code workflow:

- **Design** — Created in [Pencil](https://pencil.co) and served as the single source of truth via MCP (Model Context Protocol)
- **Code** — Generated and iterated with [OpenCode](https://opencode.ai), powered by Claude Opus 4.6
- **Every component, token, and layout decision** traces back to the Pencil design file — no guesswork, no approximations

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

[MIT](LICENSE)
