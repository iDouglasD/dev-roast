import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { tv } from "tailwind-variants";

const codeBlockVariants = tv({
  base: "w-full overflow-hidden border border-border-primary bg-bg-input",
});

type CodeBlockProps = {
  code: string;
  lang: BundledLanguage;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
};

async function CodeBlock({
  code,
  lang,
  filename,
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: "vesper",
  });

  const lines = code.split("\n");
  const lineCount = lines.length;

  return (
    <div className={codeBlockVariants({ className })}>
      {/* Header with window dots and filename */}
      <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
        <span className="size-2.5 rounded-full bg-accent-red" />
        <span className="size-2.5 rounded-full bg-accent-amber" />
        <span className="size-2.5 rounded-full bg-accent-green" />
        <span className="h-px flex-1" />
        {filename && (
          <span className="font-mono text-xs text-text-tertiary">
            {filename}
          </span>
        )}
      </div>

      {/* Code body */}
      <div className="flex">
        {/* Line numbers gutter */}
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
    </div>
  );
}

export { CodeBlock, codeBlockVariants, type CodeBlockProps };
