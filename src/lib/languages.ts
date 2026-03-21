/**
 * Language registry for the code editor.
 *
 * Maps display labels to Shiki language IDs and provides
 * lazy-loaded grammar imports for each language.
 */

type LanguageEntry = {
  /** Display label for the dropdown */
  label: string;
  /** Shiki language ID */
  id: string;
  /** Lazy grammar import for Shiki */
  import: () => Promise<unknown>;
};

/**
 * Languages preloaded at highlighter init (most common).
 * These are available immediately without async loading.
 */
const PRELOADED_LANG_IDS = ["javascript", "typescript", "python"] as const;

/**
 * Full list of supported languages.
 * Order determines dropdown display order.
 */
const LANGUAGES: LanguageEntry[] = [
  {
    label: "JavaScript",
    id: "javascript",
    import: () => import("@shikijs/langs/javascript"),
  },
  {
    label: "TypeScript",
    id: "typescript",
    import: () => import("@shikijs/langs/typescript"),
  },
  {
    label: "Python",
    id: "python",
    import: () => import("@shikijs/langs/python"),
  },
  { label: "Java", id: "java", import: () => import("@shikijs/langs/java") },
  { label: "Go", id: "go", import: () => import("@shikijs/langs/go") },
  { label: "Rust", id: "rust", import: () => import("@shikijs/langs/rust") },
  { label: "C", id: "c", import: () => import("@shikijs/langs/c") },
  { label: "C++", id: "cpp", import: () => import("@shikijs/langs/cpp") },
  { label: "C#", id: "csharp", import: () => import("@shikijs/langs/csharp") },
  { label: "Ruby", id: "ruby", import: () => import("@shikijs/langs/ruby") },
  { label: "PHP", id: "php", import: () => import("@shikijs/langs/php") },
  { label: "Swift", id: "swift", import: () => import("@shikijs/langs/swift") },
  {
    label: "Kotlin",
    id: "kotlin",
    import: () => import("@shikijs/langs/kotlin"),
  },
  { label: "Lua", id: "lua", import: () => import("@shikijs/langs/lua") },
  {
    label: "Elixir",
    id: "elixir",
    import: () => import("@shikijs/langs/elixir"),
  },
  { label: "HTML", id: "html", import: () => import("@shikijs/langs/html") },
  { label: "CSS", id: "css", import: () => import("@shikijs/langs/css") },
  { label: "SQL", id: "sql", import: () => import("@shikijs/langs/sql") },
  { label: "Shell", id: "bash", import: () => import("@shikijs/langs/bash") },
  { label: "JSON", id: "json", import: () => import("@shikijs/langs/json") },
  { label: "YAML", id: "yaml", import: () => import("@shikijs/langs/yaml") },
  {
    label: "Markdown",
    id: "markdown",
    import: () => import("@shikijs/langs/markdown"),
  },
  {
    label: "Dockerfile",
    id: "dockerfile",
    import: () => import("@shikijs/langs/dockerfile"),
  },
  {
    label: "Clojure",
    id: "clojure",
    import: () => import("@shikijs/langs/clojure"),
  },
  { label: "Julia", id: "julia", import: () => import("@shikijs/langs/julia") },
  {
    label: "Pascal",
    id: "pascal",
    import: () => import("@shikijs/langs/pascal"),
  },
];

/**
 * Find a language entry by Shiki ID.
 */
function getLanguageById(id: string): LanguageEntry | undefined {
  return LANGUAGES.find((lang) => lang.id === id);
}

/**
 * Get the display label for a Shiki language ID.
 * Returns the ID itself if not found.
 */
function getLanguageLabel(id: string): string {
  return getLanguageById(id)?.label ?? id;
}

export {
  LANGUAGES,
  PRELOADED_LANG_IDS,
  getLanguageById,
  getLanguageLabel,
  type LanguageEntry,
};
