"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  name,
  label,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  name?: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
        checked ? "border-cyan/50 bg-cyan/25" : "border-stroke bg-[#0b0c10]",
        className
      )}
    >
      {name ? <input type="hidden" name={name} value={checked ? "true" : "false"} /> : null}
      <span
        className={cn(
          "absolute top-[3px] h-4 w-4 rounded-full transition-all duration-200",
          checked ? "left-[25px] bg-cyan" : "left-[3px] bg-faint"
        )}
      />
    </button>
  );
}
