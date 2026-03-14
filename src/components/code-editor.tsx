"use client";

import { type ComponentProps, forwardRef, useCallback, useRef } from "react";
import { tv } from "tailwind-variants";

const LINE_HEIGHT_PX = 20;
const GUTTER_PADDING_Y = 16;

const codeEditorVariants = tv({
  base: "w-full overflow-hidden border border-border-primary bg-bg-input",
});

type CodeEditorProps = Omit<ComponentProps<"div">, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function getVisibleLineCount(editorBodyHeight: number): number {
  const available = editorBodyHeight - GUTTER_PADDING_Y * 2;
  return Math.max(1, Math.floor((available + 8) / (LINE_HEIGHT_PX + 8)));
}

const EDITOR_BODY_HEIGHT = 360 - 40;
const MIN_LINES = getVisibleLineCount(EDITOR_BODY_HEIGHT);

const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  ({ className, value, onChange, placeholder, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);

    const contentLines = value ? value.split("\n").length : 1;
    const lineCount = Math.max(contentLines, MIN_LINES);

    const handleScroll = useCallback(() => {
      if (textareaRef.current && gutterRef.current) {
        gutterRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }, []);

    return (
      <div ref={ref} className={codeEditorVariants({ className })} {...props}>
        {/* Window chrome */}
        <div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
          <span className="size-3 rounded-full bg-accent-red" />
          <span className="size-3 rounded-full bg-accent-amber" />
          <span className="size-3 rounded-full bg-accent-green" />
        </div>

        {/* Editor body */}
        <div className="flex h-80 overflow-hidden">
          {/* Line numbers gutter */}
          <div
            ref={gutterRef}
            className="flex w-12 shrink-0 flex-col items-end gap-2 overflow-hidden border-r border-border-primary bg-bg-surface px-3 py-4 font-mono text-xs text-text-tertiary"
            aria-hidden="true"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i} className="leading-5">
                {i + 1}
              </span>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder={placeholder}
            spellCheck={false}
            className="flex-1 resize-none bg-transparent px-4 py-4 font-mono text-xs leading-5 text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
      </div>
    );
  },
);

CodeEditor.displayName = "CodeEditor";

export { CodeEditor, codeEditorVariants, type CodeEditorProps };
