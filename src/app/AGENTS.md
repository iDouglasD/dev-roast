# App Router — Rotas, Layouts e CSS

Guia de referência para trabalhar com a camada de rotas em `src/app/`.

---

## Estrutura de Arquivos

```
src/app/
├── globals.css             # Tokens @theme inline + estilos base
├── layout.tsx              # Root layout (fonte, Navbar, TRPCReactProvider)
├── page.tsx                # Homepage (/)
├── leaderboard/
│   └── page.tsx            # Shame Leaderboard (/leaderboard)
├── roast/[id]/
│   └── page.tsx            # Roast Results (/roast/[id])
├── api/trpc/[trpc]/
│   └── route.ts            # tRPC HTTP handler
└── components/             # Dev playground (não é rota pública)
    ├── page.tsx
    └── toggle-showcase.tsx
```

---

## Root Layout (`layout.tsx`)

O layout raiz é a **única** exceção à regra de "named exports only" — Next.js exige `export default`.

```tsx
import { JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} flex min-h-screen flex-col antialiased`}>
        <Navbar />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
```

Regras do layout raiz:
- **Fonte**: `JetBrains_Mono` com `variable: "--font-jetbrains-mono"` — nunca mudar a fonte
- **Provider**: `TRPCReactProvider` engloba todos os filhos — não adicionar providers duplicados
- **Body**: `flex min-h-screen flex-col` — estrutura base que permite footer sticky
- **`antialiased`**: sempre presente no body

---

## Pages

### Convenções

- Arquivos de page sempre exportam `export default function` (obrigatório pelo Next.js)
- Pages são **Server Components por padrão** — adicionar `"use client"` apenas se necessário
- Layout/posicionamento de componentes filhos via `className` no local de uso:

```tsx
// Correto — layout aplicado na page, não dentro do componente
<RoastForm className="w-editor max-w-full" />

// Errado — não hardcodar layout dentro do componente
// (o componente não deve saber onde está na tela)
```

### Estrutura padrão de uma page

```tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { MeuComponente } from "@/components/meu-componente";

export default async function MinhaPagina() {
  // Prefetch no servidor para dados que o cliente vai precisar
  prefetch(trpc.meuRouter.minhaQuery.queryOptions());

  return (
    <HydrateClient>
      <main className="flex flex-1 flex-col items-center gap-8 pt-20">
        {/* seções */}
      </main>
    </HydrateClient>
  );
}
```

- `<main>` recebe `flex-1` para ocupar o espaço restante (abaixo do Navbar)
- `pt-20` como padding top padrão das páginas
- `HydrateClient` sempre que houver prefetch de dados tRPC
- Sem `HydrateClient` quando a page é puramente estática

### Dados estáticos temporários

Pages com dados ainda não integrados ao banco usam constantes locais como placeholder:

```tsx
const STATIC_DATA = { /* mock */ };
```

Isso é temporário — substituir pela query tRPC assim que o router estiver implementado.

---

## CSS Tokens (`globals.css`)

Todos os tokens do design system estão em `globals.css` via `@theme inline`. **Nunca** usar valores arbitrários quando um token existe.

### Categorias de tokens

| Categoria | Prefixo | Exemplos |
|-----------|---------|---------|
| Backgrounds | `bg-` | `bg-page`, `bg-input`, `bg-surface`, `bg-elevated` |
| Borders | `border-` | `border-primary`, `border-focus` |
| Text | `text-` | `text-primary`, `text-secondary`, `text-tertiary`, `text-muted` |
| Accents | `accent-` | `accent-green`, `accent-red`, `accent-amber`, `accent-cyan` |
| Syntax | `syn-` | `syn-keyword`, `syn-function`, `syn-string`, `syn-comment`, ... |
| Diff | `diff-` | `diff-removed-bg`, `diff-added-bg`, `diff-removed-text`, `diff-added-text` |
| Typography | `text-code` | Font size 13px, line-height 1 |
| Max widths | `max-w-` | `max-w-card`, `max-w-code`, `max-w-editor`, `max-w-leaderboard`, `max-w-results` |
| Widths | `w-` | `w-editor`, `w-leaderboard`, `w-results` |

### Adicionando novos tokens

Adicionar apenas em `globals.css` dentro do bloco `@theme inline`, em rem:

```css
@theme inline {
  --color-nova-cor: #abc123;
  --max-w-nova-section: 45rem;
}
```

Nunca usar valores arbitrários quando um token deve existir:
```tsx
// Errado
<div className="max-w-[780px]" />

// Correto — adicionar token e usar
<div className="max-w-editor" />
```

### Estilos globais especiais

O arquivo também contém overrides para o output do Shiki no editor de código:

```css
.code-editor-overlay pre { /* reset margens, padding, background */ }
.code-editor-overlay code { /* herda font da família do editor */ }
```

Não modificar estas regras sem ajustar `code-editor.tsx` em conjunto.

---

## API Route (`api/trpc/[trpc]/route.ts`)

Handler HTTP do tRPC — **não modificar**. Expõe `GET` e `POST` para o adapter fetch do tRPC.

```ts
export { handler as GET, handler as POST };
```

---

## Dev Playground (`app/components/`)

Rota `/components` — área de desenvolvimento para testar componentes de UI. Não é uma rota pública real.

- Renderiza todos os componentes com todas as variantes
- Útil para validar visual antes de usar em páginas reais
- Manter atualizado ao adicionar novos componentes ou variantes

---

## Metadata

Definir `metadata` em cada page/layout com `export const metadata: Metadata`:

```ts
export const metadata: Metadata = {
  title: "Dev Roast",
  description: "Paste your code. Get roasted.",
};
```

Pages filhas podem sobrescrever com sua própria `metadata`. Usar `generateMetadata` para metadata dinâmica (ex: `/roast/[id]`).

---

## Checklist para Novas Pages

- [ ] Arquivo `page.tsx` criado no diretório correto (route = path do diretório)
- [ ] Usa `export default function` (obrigatório pelo Next.js)
- [ ] `<main>` com `flex-1` e `pt-20` como container principal
- [ ] Layout de componentes via `className` no local de uso, não dentro dos componentes
- [ ] `HydrateClient` wrapping se houver prefetch tRPC
- [ ] `export const metadata` definido
- [ ] Dados estáticos temporários claramente marcados (para substituição futura)
