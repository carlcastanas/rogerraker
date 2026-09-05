"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * The server action takes plain arguments rather than FormData, so it is fired
 * inside a transition instead of through a form.
 */
export function PublishToggle({
  id,
  published,
  toggle,
  label,
}: {
  id: string;
  published: boolean;
  toggle: (id: string, next: boolean) => Promise<void>;
  label: string;
}) {
  const [pending, startTransition] = React.useTransition();
  const [optimistic, setOptimistic] = React.useOptimistic(published);

  return (
    <span className={cn("inline-flex items-center gap-2", pending && "opacity-60")}>
      <Switch
        checked={optimistic}
        label={`${optimistic ? "Unpublish" : "Publish"} ${label}`}
        onChange={(next) => {
          startTransition(async () => {
            setOptimistic(next);
            await toggle(id, next);
          });
        }}
      />
      <span className="text-[12px] text-faint">{optimistic ? "Live" : "Draft"}</span>
    </span>
  );
}
