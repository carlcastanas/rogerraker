"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dismissible confirmation strip driven by ?saved=1 / ?deleted=1 style flags. */
export function NoticeStrip({
  children,
  tone = "cyan",
  className,
}: {
  children: React.ReactNode;
  tone?: "cyan" | "muted";
  className?: string;
}) {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;

  return (
    <div
      role="status"
      className={cn(
        "mb-6 flex items-center gap-3 rounded-[2px] border px-4 py-3 text-[13px]",
        tone === "cyan"
          ? "border-cyan/35 bg-cyan/[0.07] text-cyan"
          : "border-stroke bg-panel text-muted",
        className
      )}
    >
      <Check size={15} strokeWidth={1.5} className="shrink-0" />
      <span className="flex-1">{children}</span>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="shrink-0 text-current opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}
