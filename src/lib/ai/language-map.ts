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
