"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  action,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();

  return (
    <section className="panel rounded-[2px]">
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className={cn(
              "mt-0.5 shrink-0 text-faint transition-transform duration-200",
              open ? "rotate-0" : "-rotate-90"
            )}
          />
          <span className="min-w-0">
            <span className="display-tight block text-[15px] text-ink">{title}</span>
            {description ? (
              <span className="mt-1 block max-w-[62ch] text-[13px] text-muted">{description}</span>
            ) : null}
          </span>
        </button>
        {action}
      </div>
      <div id={id} hidden={!open} className="space-y-5 border-t border-stroke p-5">
        {children}
      </div>
    </section>
  );
}
