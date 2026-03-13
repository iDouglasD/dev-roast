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

- [ ] Arquivo criado em `src/components/ui/` com nome em kebab-case
- [ ] Usa `tv()` do `tailwind-variants` para variantes
- [ ] Estende `ComponentProps<"elemento">` para props nativas
- [ ] Usa `forwardRef` com tipagem correta
- [ ] Define `displayName`
- [ ] Passa `className` dentro da chamada `tv()` (não usa `twMerge` direto)
- [ ] Exporta: componente, função de variantes e tipo de props (named exports)
- [ ] Adicionado à página de exemplos em `src/app/components/page.tsx`
- [ ] `biome check` passando sem erros
- [ ] `next build` passando sem erros
