import { type ComponentProps, forwardRef } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { tv } from "tailwind-variants";

// --- Root ---

const codeBlockRootVariants = tv({
  base: "w-full overflow-hidden border border-border-primary bg-bg-input",
});

type CodeBlockRootProps = ComponentProps<"div">;

const CodeBlockRoot = forwardRef<HTMLDivElement, CodeBlockRootProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={codeBlockRootVariants({ className })}
        {...props}
      />
    );
  },
);

CodeBlockRoot.displayName = "CodeBlockRoot";

// --- Header ---

const codeBlockHeaderVariants = tv({
  base: "flex h-10 items-center gap-3 border-b border-border-primary px-4",
});

type CodeBlockHeaderProps = ComponentProps<"div">;

const CodeBlockHeader = forwardRef<HTMLDivElement, CodeBlockHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={codeBlockHeaderVariants({ className })}
        {...props}
      >
        <span className="size-2.5 rounded-full bg-accent-red" />
        <span className="size-2.5 rounded-full bg-accent-amber" />
        <span className="size-2.5 rounded-full bg-accent-green" />
        <span className="h-px flex-1" />
        {children}
      </div>
    );
  },
);

CodeBlockHeader.displayName = "CodeBlockHeader";

// --- Body (async server component) ---

type CodeBlockBodyProps = {
  code: string;
  lang: BundledLanguage;
  showLineNumbers?: boolean;
  className?: string;
};

const codeBlockBodyVariants = tv({
  base: "flex",
});

async function CodeBlockBody({
  code,
  lang,
  showLineNumbers = true,
  className,
}: CodeBlockBodyProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: "vesper",
  });

  const lineCount = code.split("\n").length;

  return (
    <div className={codeBlockBodyVariants({ className })}>
      {showLineNumbers && (
        <div className="flex flex-col gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 py-3">
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              className="text-right font-mono text-code leading-none text-text-tertiary"
            >
              {i + 1}
            </span>
          ))}
        </div>
      )}

      <div
        className="code-block-content min-w-0 flex-1 overflow-x-auto [&_pre]:m-0! [&_pre]:bg-transparent! [&_pre]:p-3! [&_pre]:font-mono [&_pre]:text-code! [&_pre]:leading-relaxed! [&_code]:font-mono! [&_code]:text-code!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// --- Compound export ---

const CodeBlock = Object.assign(CodeBlockRoot, {
  Header: CodeBlockHeader,
  Body: CodeBlockBody,
});

export {
  CodeBlock,
  CodeBlockRoot,
  CodeBlockHeader,
  CodeBlockBody,
  codeBlockRootVariants,
  codeBlockHeaderVariants,
  codeBlockBodyVariants,
  type CodeBlockRootProps,
  type CodeBlockHeaderProps,
  type CodeBlockBodyProps,
};
