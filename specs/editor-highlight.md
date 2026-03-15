# Spec: Code Editor with Syntax Highlighting

## Summary

Replace the current plain `<textarea>` code editor on the homepage with a syntax-highlighted editor. When the user pastes or types code, it should be highlighted in real-time using our existing Shiki theme colors. The language should be auto-detected, with an optional manual override dropdown.

---

## Research Findings

### Editor approach

We analyzed four approaches for the interactive editor:

| Approach | Bundle size (gzip) | Effort | Color consistency with CodeBlock |
|---|---|---|---|
| **DIY textarea + Shiki overlay** | ~30-60 KB | Medium | Perfect |
| **react-simple-code-editor + Shiki** | ~35-65 KB | Low | Perfect |
| **CodeMirror 6 (@uiw/react-codemirror)** | ~200-350 KB | Medium-High | Different grammar system |
| **Monaco Editor** | ~600 KB-1.2 MB | High | Overkill |

**Reference implementation**: [ray-so](https://github.com/raycast/ray-so) uses the same textarea overlay approach — a transparent `<textarea>` on top of a `<div>` with Shiki-highlighted HTML. They use `shiki/core` with WASM engine + `highlight.js` for auto-detection.

**Decision: DIY textarea + Shiki overlay.**

Rationale:
- We already have Shiki in the project — zero new editor dependencies.
- Our editor is paste-focused, not a full IDE. No need for tab handling, bracket matching, undo stacks, or other editing features that `react-simple-code-editor` provides.
- A simple textarea with a highlight overlay is ~50-80 lines of code. Adding `react-simple-code-editor` (~3.5 KB) saves effort but adds a dependency for features we don't need.
- Perfect color consistency with the server-rendered `CodeBlock` component (same Shiki engine + same theme).

### Language auto-detection

We analyzed four options:

| Library | Bundle size | Languages | Shiki compat | Standalone |
|---|---|---|---|---|
| **flourite** | ~11 KB, 0 deps | 24 | Built-in `{ shiki: true }` | Yes |
| **highlight.js `highlightAuto()`** | ~300 KB (common) | 189 | Needs mapping | No (ships full engine) |
| **GitHub Linguist** | N/A | 700+ | N/A | No (Ruby only) |
| **lang-detector** | ~5 KB | 10 | No | Yes (abandoned) |

**Decision: flourite.**

Rationale:
- 11 KB, zero dependencies — negligible bundle impact.
- Built-in `{ shiki: true }` option returns Shiki-compatible language IDs with no mapping layer.
- 24 languages covers every common language users will paste.
- TypeScript source with built-in types.
- Simple API: `flourite(code, { shiki: true })` → `{ language: "javascript" }`.

---

## Architecture

### How the textarea overlay works

```
┌─────────────────────────────────────┐
│  <div> (container, CSS grid)        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ <div> (highlighted HTML)      │  │  ← z-index: 1, pointer-events: none
│  │ Shiki codeToHtml() output     │  │    Shows colored code
│  │ set via dangerouslySetInnerHTML│ │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ <textarea>                    │  │  ← z-index: 2, transparent text
│  │ User types/pastes here        │  │    -webkit-text-fill-color: transparent
│  │ Only caret is visible         │  │    caret-color: white
│  └───────────────────────────────┘  │
│                                     │
│  Both occupy the same grid cell     │
│  (grid-area: 1 / 1) with identical  │
│  font, padding, line-height         │
└─────────────────────────────────────┘
```

### Shiki client-side setup

- Use `createHighlighterCore` from `shiki/core` (fine-grained, tree-shakeable).
- Use `createJavaScriptRegexEngine` from `shiki/engine/javascript` (no WASM binary needed).
- Import only the languages we support from `@shikijs/langs/*`.
- Import our theme from `@shikijs/themes/*` (or use custom theme with our `syn-*` CSS tokens).
- Create a **singleton** highlighter instance (module-level promise, resolved once).
- Call `highlighter.codeToHtml()` on each change with **debounce (~150ms)**.

### Language detection flow

```
User pastes/types code
        │
        ▼
  flourite(code, { shiki: true })
        │
        ▼
  { language: "typescript" }
        │
        ├──► Update language label in UI
        ├──► Load Shiki grammar if not loaded (lazy)
        └──► Re-highlight with detected language
```

- Auto-detection runs on every change (debounced together with highlighting).
- If the user manually selects a language from the dropdown, auto-detection is **bypassed** — the selected language is used until the user switches back to "Auto-detect".
- When flourite returns `"unknown"`, fall back to `"text"` (no highlighting).

### Language dropdown

- Positioned in the editor header/toolbar area (matches the existing Pencil design).
- Default option: **"Auto-detect"** — shows the detected language name in parentheses, e.g. `Auto-detect (TypeScript)`.
- Manual options: A curated list of ~15-20 languages (JS, TS, Python, Java, Go, Rust, C, C++, C#, Ruby, PHP, Swift, Kotlin, HTML, CSS, SQL, Shell, JSON, YAML, Markdown).
- When user selects a language manually, we load the corresponding Shiki grammar (lazy) and re-highlight.

### Lazy language loading

Not all Shiki grammars should be bundled upfront. Strategy:

1. **Preload** at module init: `javascript`, `typescript`, `python` (most common).
2. **Lazy-load** on demand: all other languages via dynamic `import()`.
3. Show a brief loading state (or keep previous highlight) while a grammar loads.

### Integration with existing components

The current `CodeEditor` component (`src/components/code-editor.tsx`) is a client component with a plain `<textarea>` and a line numbers gutter. The refactor should:

- Keep the line numbers gutter as-is.
- Replace the plain textarea body with the overlay pattern (textarea + highlighted div).
- Keep the same visual design (bg-bg-input, border, padding, font, line-height).
- The `RoastForm` parent component passes the code value up — this interface stays the same.

---

## New dependencies

| Package | Purpose | Size |
|---|---|---|
| `flourite` | Language auto-detection | ~11 KB, 0 deps |

No new editor library needed. Shiki is already installed (`shiki@^4.0.2`).

> Note: Verify that Shiki v4's fine-grained imports (`shiki/core`, `shiki/engine/javascript`) work correctly. If the API has changed from v1 (which ray-so uses), check the Shiki v4 docs for the equivalent imports.

---

## Component changes

### `CodeEditor` (`src/components/code-editor.tsx`)

- Add Shiki highlighter singleton (module-level, JS regex engine, lazy langs).
- Replace plain textarea with overlay pattern (transparent textarea + highlighted div).
- Add debounced highlight effect (~150ms).
- Add `language` prop (controlled from parent) and `onLanguageChange` callback.
- Keep line numbers gutter unchanged.

### `RoastForm` (`src/components/roast-form.tsx`)

- Add language state: `{ mode: "auto" | "manual", language: string }`.
- Add language dropdown (in the editor header area or near the toggle).
- Wire flourite auto-detection on code change.
- Pass `language` and `onLanguageChange` to `CodeEditor`.

### New: Language selector component

- Dropdown/select with "Auto-detect" as first option.
- Curated list of supported languages.
- Shows detected language name when in auto mode.
- Could be a simple `<select>` or a Base UI Select — decide during implementation.

---

## Open questions

- [ ] Should we use our existing `vesper` Shiki theme (which we use in `CodeBlock`) or create a custom theme that maps to our `--color-syn-*` CSS variables? The CSS variables approach (like ray-so does) would let us change colors without re-highlighting, but vesper already matches our design closely.
- [ ] Do we need to handle the line numbers gutter differently when highlighting is active? Currently line numbers are rendered as a side column with static `1-16` numbers. With real highlighting, line numbers should match the actual code lines.
- [ ] What should the mobile experience be? Pasting code on mobile is less common, but the editor should still be usable.

---

## Implementation to-dos

- [ ] Install `flourite` dependency
- [ ] Create Shiki client-side highlighter singleton (core + JS engine + lazy langs)
- [ ] Build textarea overlay component (transparent textarea + highlighted div)
- [ ] Integrate flourite auto-detection (debounced, on code change)
- [ ] Add language dropdown to RoastForm (auto-detect + manual options)
- [ ] Wire language state through RoastForm → CodeEditor
- [ ] Update line numbers to reflect actual code lines (not static 1-16)
- [ ] Test with paste, typing, language switching, and empty state
- [ ] Verify Biome check + build pass
