"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function ToggleShowcase() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex items-center gap-8">
      <Toggle
        checked={checked}
        onCheckedChange={setChecked}
        label="roast mode"
      />
      <Toggle defaultChecked={false} label="roast mode" />
    </div>
  );
}
