"use client";

import {
  type ComponentProps,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { tv } from "tailwind-variants";
import { highlight } from "@/lib/highlighter";

const LINE_HEIGHT_PX = 20;
const GUTTER_PADDING_Y = 16;
const HIGHLIGHT_DEBOUNCE_MS = 150;

export const MAX_CODE_CHARS = 2000;

export function countCodeChars(code: string): number {
  return code.replace(/\s/g, "").length;
}

const codeEditorVariants = tv({
  base: "w-full overflow-hidden border border-border-primary bg-bg-input",
});

const charCounterVariants = tv({
  base: "font-mono text-xs tabular-nums",
  variants: {
    overLimit: {
      true: "text-accent-red",
      false: "text-text-tertiary",
    },
  },
  defaultVariants: { overLimit: false },
});

type CodeEditorProps = Omit<ComponentProps<"div">, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
};

function getVisibleLineCount(editorBodyHeight: number): number {
  const available = editorBodyHeight - GUTTER_PADDING_Y * 2;
  return Math.max(1, Math.floor((available + 8) / (LINE_HEIGHT_PX + 8)));
}

const EDITOR_BODY_HEIGHT = 360 - 40;
const MIN_LINES = getVisibleLineCount(EDITOR_BODY_HEIGHT);

const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  ({ className, value, onChange, language, placeholder, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [highlightedHtml, setHighlightedHtml] = useState("");

    const contentLines = value ? value.split("\n").length : 1;
    const lineCount = Math.max(contentLines, MIN_LINES);

    // Sync scroll between textarea, gutter, and overlay
    const handleScroll = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (gutterRef.current) {
        gutterRef.current.scrollTop = textarea.scrollTop;
      }
      if (overlayRef.current) {
        overlayRef.current.scrollTop = textarea.scrollTop;
        overlayRef.current.scrollLeft = textarea.scrollLeft;
      }
    }, []);

    // Debounced syntax highlighting
    useEffect(() => {
      if (!value) {
        setHighlightedHtml("");
        return;
      }

      const timer = setTimeout(async () => {
        try {
          const html = await highlight(value, language);
          setHighlightedHtml(html);
        } catch {
          setHighlightedHtml("");
        }
      }, HIGHLIGHT_DEBOUNCE_MS);

      return () => clearTimeout(timer);
    }, [value, language]);

    return (
      <div ref={ref} className={codeEditorVariants({ className })} {...props}>
        {/* Window chrome */}
        <div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
          <span className="size-3 rounded-full bg-accent-red" />
          <span className="size-3 rounded-full bg-accent-amber" />
          <span className="size-3 rounded-full bg-accent-green" />
        </div>

        {/* Char counter */}
        <div className="flex justify-end border-b border-border-primary px-3 py-1">
          <span
            className={charCounterVariants({
              overLimit: countCodeChars(value) > MAX_CODE_CHARS,
            })}
          >
            {countCodeChars(value)}/{MAX_CODE_CHARS}
          </span>
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

          {/* Code area: overlay + textarea stacked via CSS grid */}
          <div className="relative min-w-0 flex-1">
            {/* Highlighted code overlay */}
            <div
              ref={overlayRef}
              className="code-editor-overlay pointer-events-none absolute inset-0 overflow-auto px-4 py-4 font-mono text-xs leading-5 whitespace-pre-wrap break-all"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />

            {/* Transparent textarea for input */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              placeholder={placeholder}
              spellCheck={false}
              className="absolute inset-0 size-full resize-none bg-transparent px-4 py-4 font-mono text-xs leading-5 text-transparent caret-text-primary outline-none placeholder:text-text-muted whitespace-pre-wrap break-all"
            />
          </div>
        </div>
      </div>
    );
  },
);

CodeEditor.displayName = "CodeEditor";

export { CodeEditor, codeEditorVariants, type CodeEditorProps };
