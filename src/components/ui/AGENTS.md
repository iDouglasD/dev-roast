# UI Components — Padrões de Criação

Guia de referência para agentes de IA e desenvolvedores ao criar componentes na pasta `src/components/ui`.

---

## Stack

- **React** com **TypeScript**
- **Tailwind CSS** para estilização
- **tailwind-variants** (`tv`) para variantes — já integra `tailwind-merge` internamente
- **Nunca** importar `twMerge` diretamente; o merge de classes é feito pelo `tv()` via prop `className`

---

## Regras Gerais

1. **Named exports apenas** — nunca usar `export default`
2. **Exportar**: o componente, a função de variantes e o tipo de props
3. **Estender props nativas** do elemento HTML via `ComponentProps<"elemento">`
4. **Usar `forwardRef`** para encaminhar refs ao elemento DOM raiz
5. **Definir `displayName`** no componente após o `forwardRef`
6. **Um componente por arquivo** — nome do arquivo em `kebab-case` (ex: `button.tsx`, `text-input.tsx`)

---

## Estrutura de um Componente

```tsx
import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

// 1. Definir variantes com tv()
const exemploVariants = tv({
  base: "...", // classes base compartilhadas por todas as variantes
  variants: {
    variant: {
      primary: "...",
      secondary: "...",
    },
    size: {
      sm: "...",
      md: "...",
      lg: "...",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// 2. Extrair tipos das variantes
type ExemploVariants = VariantProps<typeof exemploVariants>;

// 3. Tipo de props = props nativas + variantes
type ExemploProps = ComponentProps<"div"> & ExemploVariants;

// 4. Componente com forwardRef
const Exemplo = forwardRef<HTMLDivElement, ExemploProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={exemploVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);

Exemplo.displayName = "Exemplo";

// 5. Named exports
export { Exemplo, exemploVariants, type ExemploProps };
```

---

## Merge de Classes — Como Funciona

O `tailwind-variants` já usa `tailwind-merge` internamente (`twMerge: true` por padrão). Para permitir override de classes pelo consumidor, basta passar `className` como propriedade na chamada do `tv()`:

```tsx
// Dentro do componente:
className={exemploVariants({ variant, size, className })}

// Uso pelo consumidor:
<Exemplo className="mt-4 bg-pink-500" />
// As classes de bg-pink-500 vão sobrescrever a cor da variante
```

**Nunca** fazer:
```tsx
// ERRADO — não importar twMerge manualmente
import { twMerge } from "tailwind-merge";
className={twMerge(exemploVariants({ variant, size }), className)}

// ERRADO — não usar template literals para juntar classes
className={`classes-base ${className ?? ""}`}

// ERRADO — não usar operador ternário/nullish para className
className={className ? `base ${className}` : "base"}
```

---

## Regra Obrigatória: `tv()` em Todo Componente

**Todo componente do projeto** — seja em `src/components/ui/` ou `src/components/` — **deve** usar `tv()` para definir suas classes base e aceitar `className` como prop para merge via `tailwind-variants`.

Isso se aplica a:
- Componentes primitivos de UI (`src/components/ui/`)
- Componentes de feature/layout (`src/components/`)
- Componentes com ou sem variantes

Mesmo que o componente não tenha variantes, deve usar `tv()` com apenas a propriedade `base`:

```tsx
import { tv } from "tailwind-variants";

const navbarVariants = tv({
  base: "flex h-14 items-center justify-between",
});

// No JSX:
<nav className={navbarVariants({ className })} {...props}>
```

Isso garante que qualquer consumidor possa customizar o componente via `className` com merge inteligente de classes (sem conflitos), mantendo um padrão único no projeto.

---

## Componentes de Feature/Layout (fora de `ui/`)

Componentes em `src/components/` (ex: `navbar.tsx`, `roast-form.tsx`, `code-editor.tsx`) seguem o mesmo padrão de `tv()` para className, mas com diferenças:

- **Não precisam** de `forwardRef` / `displayName` (a menos que sejam wrappers de elementos que precisem de ref)
- **Devem** aceitar `className` via props e usar `tv()` para merge
- **Devem** exportar: componente, variantes e tipo de props (named exports)
- Estilização de layout/posicionamento (ex: `w-editor`, `max-w-full`) deve ser aplicada via `className` no local de uso, não hardcoded no componente

```tsx
import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

const featureVariants = tv({
  base: "flex flex-col gap-4",
});

type FeatureProps = ComponentProps<"div">;

function Feature({ className, ...props }: FeatureProps) {
  return <div className={featureVariants({ className })} {...props} />;
}

export { Feature, featureVariants, type FeatureProps };
```

---

## Variantes Compostas (Compound Variants)

Quando uma combinação específica de variantes precisa de estilos diferentes:

```tsx
const buttonVariants = tv({
  base: "...",
  variants: {
    variant: { primary: "...", outline: "..." },
    size: { sm: "...", lg: "..." },
  },
  compoundVariants: [
    {
      variant: "outline",
      size: "sm",
      class: "border-2",
    },
  ],
});
```

---

## Convenções de Nomes

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Arquivo | `kebab-case.tsx` | `button.tsx`, `text-input.tsx` |
| Componente | `PascalCase` | `Button`, `TextInput` |
| Variantes | `camelCase` + `Variants` | `buttonVariants`, `textInputVariants` |
| Tipo de props | `PascalCase` + `Props` | `ButtonProps`, `TextInputProps` |

---

## Checklist para Novos Componentes

- [ ] Arquivo criado em `src/components/` (ou `src/components/ui/`) com nome em kebab-case
- [ ] Usa `tv()` do `tailwind-variants` para classes base (mesmo sem variantes)
- [ ] Aceita `className` via props e passa dentro da chamada `tv()` — nunca usa template literals, `??`, ou `twMerge` direto
- [ ] Estende `ComponentProps<"elemento">` para props nativas
- [ ] Usa `forwardRef` com tipagem correta (obrigatório em `ui/`, opcional em `components/`)
- [ ] Define `displayName` (obrigatório em `ui/`, opcional em `components/`)
- [ ] Exporta: componente, função de variantes e tipo de props (named exports)
- [ ] Estilos de layout/posicionamento aplicados via `className` no local de uso
- [ ] `biome check` passando sem erros
- [ ] `next build` passando sem erros
