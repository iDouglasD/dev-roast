/**
 * Client-side Shiki highlighter singleton.
 *
 * Uses fine-grained imports (shiki/core + JS regex engine) to minimize
 * bundle size. Preloads the 3 most common languages at init; others
 * are loaded on demand via `ensureLanguage()`.
 */

import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { getLanguageById } from "@/lib/languages";

type HighlighterCore = Awaited<ReturnType<typeof createHighlighterCore>>;

let highlighterPromise: Promise<HighlighterCore> | null = null;

/**
 * Get or create the singleton highlighter.
 * Preloads javascript, typescript, python, and the vesper theme.
 */
function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("@shikijs/themes/vesper")],
      langs: [
        import("@shikijs/langs/javascript"),
        import("@shikijs/langs/typescript"),
        import("@shikijs/langs/python"),
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

/**
 * Ensure a language grammar is loaded. If it's not already loaded,
 * dynamically imports it. Returns true if the language is available.
 */
async function ensureLanguage(langId: string): Promise<boolean> {
  const highlighter = await getHighlighter();
  const loaded = highlighter.getLoadedLanguages();

  if (loaded.includes(langId)) {
    return true;
  }

  const entry = getLanguageById(langId);
  if (!entry) {
    return false;
  }

  try {
    const grammar = await entry.import();
    await highlighter.loadLanguage(
      grammar as Parameters<HighlighterCore["loadLanguage"]>[0],
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Highlight code and return HTML string.
 * Ensures the language is loaded before highlighting.
 * Falls back to plain text if the language can't be loaded.
 */
async function highlight(code: string, langId: string): Promise<string> {
  const highlighter = await getHighlighter();
  const available = await ensureLanguage(langId);
  const lang = available ? langId : "text";

  return highlighter.codeToHtml(code, {
    lang,
    theme: "vesper",
  });
}

export { getHighlighter, ensureLanguage, highlight };
