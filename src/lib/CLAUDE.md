# Lib — Utilitários Compartilhados

Guia de referência para trabalhar com os utilitários em `src/lib/`.

---

## Estrutura de Arquivos

```
src/lib/
├── highlighter.ts   # Singleton do Shiki para o editor (client-side)
└── languages.ts     # Registry de linguagens suportadas
```

---

## Highlighter Singleton (`highlighter.ts`)

### Por que singleton?

Criar o highlighter do Shiki é uma operação cara (carrega grammars e o tema). O singleton garante que isso aconteça **uma única vez** durante o ciclo de vida da aplicação no cliente.

### API pública

```ts
import { highlight, ensureLanguage, getHighlighter } from "@/lib/highlighter";

// Highlightar código e retornar HTML
const html = await highlight(code, "typescript");

// Garantir que uma linguagem está carregada (retorna true/false)
const ok = await ensureLanguage("rust");

// Acesso direto ao highlighter (raro — prefira highlight())
const hl = await getHighlighter();
```

### Como funciona

```ts
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("@shikijs/themes/vesper")],
      langs: [/* JS, TS, Python preloaded */],
      engine: createJavaScriptRegexEngine(),  // sem WASM
    });
  }
  return highlighterPromise;
}
```

- Usa **`shiki/core`** com imports finos — não importar `shiki` diretamente (bundle maior)
- Engine: **`createJavaScriptRegexEngine()`** — sem dependência de WASM
- Tema fixo: **`vesper`** — não mudar sem atualizar `globals.css`
- Linguagens pré-carregadas: `javascript`, `typescript`, `python` (disponíveis imediatamente)
- Demais linguagens: carregadas sob demanda via `ensureLanguage()`

### Fallback

Se uma linguagem não está no registry ou falha ao carregar, `highlight()` faz fallback para `"text"` (sem colorização, sem erros).

### Uso no editor (client-side)

O editor de código (`code-editor.tsx`) usa `highlight()` com debounce de **150ms** para não sobrecarregar enquanto o usuário digita.

### Uso em Server Components

Para blocos de código estáticos (ex: `CodeBlock.Body`), usar `codeToHtml` diretamente do `shiki` (import diferente — sem o singleton). O singleton é **exclusivo para uso client-side** no editor interativo.

```ts
// Em Server Components (code-block.tsx):
import { codeToHtml } from "shiki";
const html = await codeToHtml(code, { lang, theme: "vesper" });
```

---

## Language Registry (`languages.ts`)

### API pública

```ts
import {
  LANGUAGES,
  PRELOADED_LANG_IDS,
  getLanguageById,
  getLanguageLabel,
  type LanguageEntry,
} from "@/lib/languages";

// Lista completa de linguagens (para o dropdown)
LANGUAGES; // LanguageEntry[]

// IDs preloaded (para sincronizar com o highlighter)
PRELOADED_LANG_IDS; // ["javascript", "typescript", "python"]

// Buscar entrada por Shiki ID
getLanguageById("rust"); // LanguageEntry | undefined

// Obter label de exibição pelo ID
getLanguageLabel("bash"); // "Shell"
```

### Tipo `LanguageEntry`

```ts
type LanguageEntry = {
  label: string;                     // Label para o dropdown
  id: string;                        // Shiki language ID
  import: () => Promise<unknown>;    // Lazy import da grammar
};
```

### Adicionando novas linguagens

1. Adicionar entrada no array `LANGUAGES` em `languages.ts` (em ordem alfabética ou agrupada por popularidade)
2. O import deve usar `@shikijs/langs/<id>` — verificar se o pacote existe no Shiki
3. Adicionar o ID ao enum `languageEnum` em `src/db/schema.ts` e gerar migration
4. Se for uma linguagem muito comum, adicionar ao `PRELOADED_LANG_IDS` e ao `createHighlighterCore` em `highlighter.ts`

```ts
// languages.ts — adicionar na posição correta
{ label: "Zig", id: "zig", import: () => import("@shikijs/langs/zig") },
```

### Sincronização com o DB

O `languageEnum` no schema do banco **não precisa** ter todas as linguagens do `LANGUAGES` — só as que queremos armazenar como roasts. Novas linguagens aceitas para roast devem ser adicionadas ao enum e migradas.

---

## Checklist para Novas Linguagens

- [ ] Entrada adicionada em `LANGUAGES` com `label`, `id` e `import` corretos
- [ ] `import` aponta para `@shikijs/langs/<id>` (verificar existência)
- [ ] Se linguagem comum: adicionada a `PRELOADED_LANG_IDS` + `createHighlighterCore`
- [ ] Se suportada para roast: `languageEnum` atualizado + `npm run db:generate` + `db:migrate`
