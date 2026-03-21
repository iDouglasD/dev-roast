"use client";

import { useMutation } from "@tanstack/react-query";
import flourite from "flourite";
import { useRouter } from "next/navigation";
import { type ComponentProps, useCallback, useEffect, useState } from "react";
import { tv } from "tailwind-variants";
import {
  CodeEditor,
  countCodeChars,
  MAX_CODE_CHARS,
} from "@/components/code-editor";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useTRPC } from "@/trpc/client";

const DETECT_DEBOUNCE_MS = 300;

const roastFormVariants = tv({
  base: "flex flex-col items-center gap-8",
});

type RoastFormProps = ComponentProps<"div">;

function RoastForm({ className, ...props }: RoastFormProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const createRoast = useMutation(trpc.roast.create.mutationOptions());
  const isSubmitting = createRoast.isPending;

  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);

  /** "auto" or a specific Shiki language ID */
  const [languageMode, setLanguageMode] = useState<"auto" | string>("auto");
  /** Language detected by flourite (updated on code change) */
  const [detectedLanguage, setDetectedLanguage] = useState("text");

  // Auto-detect language when code changes (debounced)
  useEffect(() => {
    if (languageMode !== "auto") return;
    if (!code.trim()) {
      setDetectedLanguage("text");
      return;
    }

    const timer = setTimeout(() => {
      const result = flourite(code, { shiki: true });
      setDetectedLanguage(
        result.language === "Unknown" ? "text" : result.language,
      );
    }, DETECT_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [code, languageMode]);

  const handleLanguageChange = useCallback((mode: "auto" | string) => {
    setLanguageMode(mode);
  }, []);

  /** The effective language passed to the editor */
  const activeLanguage =
    languageMode === "auto" ? detectedLanguage : languageMode;

  const handleSubmit = () => {
    createRoast.mutate(
      { code, language: activeLanguage, roastMode },
      { onSuccess: (data) => router.push(`/roast/${data.id}`) },
    );
  };

  return (
    <div className={roastFormVariants({ className })} {...props}>
      {/* Language selector — above editor */}
      <div className="flex w-full justify-end">
        <LanguageSelector
          mode={languageMode}
          detectedLanguage={detectedLanguage}
          onChange={handleLanguageChange}
        />
      </div>

      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={setCode}
        language={activeLanguage}
        placeholder="// paste your code here..."
      />

      {/* Actions Bar */}
      <div className="flex w-full items-center justify-between">
        {/* Left: Toggle + hint */}
        <div className="flex items-center gap-3">
          <Toggle
            checked={roastMode}
            onCheckedChange={setRoastMode}
            label="roast mode"
          />
          <span className="font-mono text-xs text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </span>
        </div>

        {/* Right: Submit */}
        <Button
          variant="primary"
          size="md"
          className="px-6 py-2.5"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            code.length === 0 ||
            countCodeChars(code) > MAX_CODE_CHARS
          }
        >
          {isSubmitting ? "$ roasting..." : "$ roast_my_code"}
        </Button>
      </div>

      {createRoast.isError && (
        <p className="font-mono text-xs text-accent-red">
          {"// error: failed to generate roast. try again."}
        </p>
      )}
    </div>
  );
}

export { RoastForm, roastFormVariants, type RoastFormProps };
