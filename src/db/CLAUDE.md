# Database Layer — Drizzle ORM

Guia de referência para trabalhar com a camada de banco de dados em `src/db/`.

---

## Stack

- **Drizzle ORM** com driver `node-postgres`
- **PostgreSQL 16** via Docker (`docker-compose.yml`)
- **drizzle-kit** para geração e execução de migrations
- Casing: `snake_case` no banco, camelCase no TypeScript (configurado via `casing: "snake_case"`)

---

## Estrutura de Arquivos

```
src/db/
├── index.ts      # Instância do Drizzle (exporta `db`)
├── schema.ts     # Tabelas + enums
└── seed.ts       # Script de seed com dados de teste
```

---

## Client (`index.ts`)

O arquivo exporta uma única instância `db` do Drizzle. Sempre importe de `@/db`:

```ts
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
});
```

- **`casing: "snake_case"`** — Drizzle converte automaticamente colunas `snake_case` do banco para `camelCase` no TypeScript. Nunca use `.("nome_coluna")` manualmente.
- `DATABASE_URL` vem do `.env` local — nunca commitar.

---

## Schema (`schema.ts`)

### Enums

Sempre definir enums com `pgEnum` antes das tabelas. Exportar todos os enums.

```ts
export const severityEnum = pgEnum("severity", ["critical", "warning", "good"]);
```

Enums existentes:

| Enum | Valores |
|------|---------|
| `severityEnum` | `"critical"`, `"warning"`, `"good"` |
| `verdictEnum` | `"needs_serious_help"`, `"try_harder"`, `"not_terrible"`, `"almost_decent"`, `"mass_respect"` |
| `diffLineTypeEnum` | `"added"`, `"removed"`, `"context"` |
| `languageEnum` | `"javascript"`, `"typescript"`, `"python"`, `"java"`, `"csharp"`, `"go"`, `"rust"`, `"ruby"`, `"php"`, `"sql"`, `"html"`, `"css"`, `"other"` |

### Tabelas

Padrão para definição de tabelas:

```ts
export const minhaTabela = pgTable(
  "minha_tabela",
  {
    id: uuid().primaryKey().defaultRandom(),        // PK sempre UUID
    campoTexto: text().notNull(),
    campoOpcional: text(),                          // sem .notNull() = nullable
    sortOrder: integer().notNull().default(0),      // default inline no schema
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_minha_tabela_campo").on(t.campo)],  // índices como 3º argumento
);
```

Regras:
- **PK**: sempre `uuid().primaryKey().defaultRandom()`
- **Timestamps**: sempre `timestamp({ withTimezone: true })`
- **FK com cascade**: `.references(() => tabela.id, { onDelete: "cascade" })`
- **Índices**: definidos no 3º argumento de `pgTable` como array de `index()`
- **Defaults**: definir inline no schema, não no banco via SQL

### Foreign Keys

```ts
roastId: uuid()
  .notNull()
  .references(() => roasts.id, { onDelete: "cascade" }),
```

Sempre usar `onDelete: "cascade"` para entidades filhas (issues, diffLines, etc.).

### Tabelas existentes

| Tabela | Descrição |
|--------|-----------|
| `roasts` | Roast principal: código, score, verdict, comentário |
| `roastIssues` | Issues vinculadas a um roast (severity, título, descrição) |
| `roastDiffLines` | Linhas do diff sugerido (added/removed/context) |

---

## Migrations

```bash
npm run db:generate   # Gera migration SQL a partir do schema
npm run db:migrate    # Aplica migrations pendentes
npm run db:studio     # Abre o Drizzle Studio (UI de inspeção)
```

- Migrations ficam em `drizzle/` — **nunca editar arquivos gerados manualmente**.
- Após qualquer alteração no `schema.ts`, rodar `db:generate` + `db:migrate`.

---

## Queries

Usar a API de query builder do Drizzle. Evitar SQL raw (use `sql` template tag apenas para agregações ou funções específicas do PostgreSQL).

```ts
// Select simples
const rows = await ctx.db.select().from(roasts).where(eq(roasts.id, id));

// Agregação com sql tag
const result = await ctx.db
  .select({
    count: sql<number>`count(*)::int`,
    avgScore: sql<number>`round(avg(${roasts.score})::numeric, 1)::float`,
  })
  .from(roasts);
```

Regras de queries:
- Sempre tipar o resultado esperado no `sql<T>` template tag
- Usar `.then((rows) => rows[0])` para queries que retornam uma única linha
- Cast explícito no PostgreSQL quando necessário (`::int`, `::float`, `::numeric`)
- Preferir `coalesce()` para evitar `null` em agregações: `coalesce(avg(...), 0)`

---

## Seed (`seed.ts`)

Script executado com `npm run db:seed`. Usa `@faker-js/faker` para gerar dados de teste.

- Gera 100 roasts com dados realistas por linguagem
- Issues e diff lines são inseridos em transações junto com o roast pai
- Distribuição de severidade guiada pelo score do roast (baixo score → mais críticos)
- Não incluir em build de produção — é um script standalone (`tsx src/db/seed.ts`)

---

## Checklist para Novas Tabelas

- [ ] Enum definido com `pgEnum` antes da tabela (se necessário)
- [ ] PK `uuid().primaryKey().defaultRandom()`
- [ ] FK com `onDelete: "cascade"` para entidades filhas
- [ ] Índices no 3º argumento de `pgTable` com nome descritivo (`idx_tabela_campo`)
- [ ] `timestamp({ withTimezone: true })` para campos de data
- [ ] `npm run db:generate` executado após alterações no schema
- [ ] `npm run db:migrate` executado para aplicar ao banco local
