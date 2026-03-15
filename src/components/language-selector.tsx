"use client";

import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";
import { getLanguageLabel, LANGUAGES } from "@/lib/languages";

const languageSelectorVariants = tv({
  base: "flex items-center gap-2 font-mono text-xs text-text-secondary",
});

type LanguageSelectorProps = Omit<ComponentProps<"div">, "onChange"> & {
  /** Current language mode: "auto" or a specific Shiki language ID */
  mode: "auto" | string;
  /** The auto-detected language ID (shown as hint when mode is "auto") */
  detectedLanguage: string;
  /** Called when the user picks a language or switches back to auto */
  onChange: (mode: "auto" | string) => void;
};

function LanguageSelector({
  className,
  mode,
  detectedLanguage,
  onChange,
  ...props
}: LanguageSelectorProps) {
  return (
    <div className={languageSelectorVariants({ className })} {...props}>
      <select
        value={mode}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent font-mono text-xs text-text-secondary outline-none transition-colors hover:text-text-primary [&>option]:bg-bg-elevated [&>option]:text-text-primary"
      >
        <option value="auto">
          auto-detect
          {detectedLanguage && detectedLanguage !== "unknown"
            ? ` (${getLanguageLabel(detectedLanguage)})`
            : ""}
        </option>
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export {
  LanguageSelector,
  languageSelectorVariants,
  type LanguageSelectorProps,
};
