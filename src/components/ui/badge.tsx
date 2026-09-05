import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "cyan" | "ember" | "muted" | "success";
}) {
  const tones = {
    default: "border-stroke-strong bg-[#111216] text-muted",
    cyan: "border-cyan/35 bg-cyan/10 text-cyan",
    ember: "border-[#ff6a3d]/35 bg-[#ff6a3d]/10 text-ember",
    muted: "border-stroke bg-transparent text-faint",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 text-[11px] leading-5",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
