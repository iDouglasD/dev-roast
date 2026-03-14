"use client";

import { type ComponentProps, useState } from "react";
import { tv } from "tailwind-variants";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

const roastFormVariants = tv({
  base: "flex flex-col items-center gap-8",
});

type RoastFormProps = ComponentProps<"div">;

function RoastForm({ className, ...props }: RoastFormProps) {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);

  return (
    <div className={roastFormVariants({ className })} {...props}>
      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={setCode}
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
        <Button variant="primary" size="md" className="px-6 py-2.5">
          $ roast_my_code
        </Button>
      </div>
    </div>
  );
}

export { RoastForm, roastFormVariants, type RoastFormProps };
