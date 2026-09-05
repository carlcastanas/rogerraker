"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

/**
 * Two-step destructive action. The confirm step is a small centred dialog rather
 * than an anchored popover, because these buttons live inside horizontally
 * scrolling tables that would clip one. Deliberately not window.confirm.
 */
export function ConfirmAction({
  action,
  id,
  body,
  confirmLabel = "Delete",
  triggerLabel = "Delete",
  iconOnly = true,
  className,
}: {
  action: ServerFormAction;
  id: string;
  body: string;
  confirmLabel?: string;
  triggerLabel?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[2px] border border-stroke text-[13px] text-muted transition-colors hover:border-[#7f2a2a] hover:text-[#ff8a8a]",
          iconOnly ? "h-8 w-8 justify-center" : "h-8 px-3",
          className
        )}
      >
        <Trash2 size={15} strokeWidth={1.5} />
        {iconOnly ? null : <span className="display-tight">{confirmLabel}</span>}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-5">
          <div
            className="absolute inset-0 bg-[#05060a]/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={triggerLabel}
            className="panel relative w-full max-w-[360px] rounded-[2px] p-5"
          >
            <h2 className="display-tight text-[15px] text-ink">Confirm</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{body}</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <Button type="submit" variant="danger" size="sm" autoFocus>
                  {confirmLabel}
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
