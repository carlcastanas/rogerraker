"use client";

import * as React from "react";
import { ArrowLeft, Mail, MailOpen, Reply } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteMessageAction, markMessageReadAction } from "@/lib/actions/messages";
import type { Message } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { ConfirmAction } from "./confirm-action";
import { EmptyState } from "./primitives";

function timestamp(value: string) {
  const d = new Date(value);
  return `${formatDate(d)} · ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function MessageReader({ messages }: { messages: Message[] }) {
  // null means "nothing picked yet": the desktop pane still previews the newest
  // message, while the mobile layout stays on the list.
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // A selection that no longer exists (deleted) falls back to the newest message
  // and drops the mobile layout back to the list — derived, so no effect needed.
  const picked = selectedId ? messages.find((m) => m.id === selectedId) ?? null : null;
  const selected = picked ?? (messages.length ? messages[0] : null);

  if (!messages.length) {
    return (
      <div className="panel rounded-[2px]">
        <EmptyState
          icon={Mail}
          title="Inbox is empty"
          body="Enquiries from the contact page arrive here, unread and newest first."
        />
      </div>
    );
  }

  const detailOpenOnMobile = picked !== null;

  return (
    <div className="panel grid overflow-hidden rounded-[2px] md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
      {/* List */}
      <div
        className={cn(
          "min-w-0 border-stroke md:block md:border-r",
          detailOpenOnMobile ? "hidden" : "block"
        )}
      >
        <div className="flex items-center justify-between border-b border-stroke px-4 py-3">
          <p className="label">Inbox</p>
          <p className="tnum text-[12px] text-faint">
            {messages.filter((m) => !m.is_read).length} unread
          </p>
        </div>
        <ul className="max-h-[70vh] divide-y divide-stroke overflow-y-auto">
          {messages.map((m) => {
            const active = selected?.id === m.id;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-full border-l-2 px-4 py-3 text-left transition-colors",
                    active
                      ? "border-cyan bg-cyan/[0.06]"
                      : "border-transparent hover:bg-[rgba(245,245,247,.03)]",
                    !m.is_read && !active && "bg-[rgba(34,211,238,.03)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        m.is_read ? "bg-transparent" : "bg-cyan"
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "flex-1 truncate text-[13px]",
                        m.is_read ? "text-muted" : "display-tight text-ink"
                      )}
                    >
                      {m.name}
                    </span>
                    <span className="tnum shrink-0 text-[11px] text-faint">
                      {formatDate(m.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 truncate pl-3.5 text-[12px] text-faint">
                    {m.project_type ?? "No project type"}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Detail */}
      <div className={cn("min-w-0", detailOpenOnMobile ? "block" : "hidden md:block")}>
        {selected ? (
          <article>
            <header className="border-b border-stroke px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-cyan md:hidden"
              >
                <ArrowLeft size={14} strokeWidth={1.5} />
                All messages
              </button>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="display-tight text-[17px] text-ink">{selected.name}</h2>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-[13px] text-muted transition-colors hover:text-cyan"
                  >
                    {selected.email}
                  </a>
                  <p className="tnum mt-1 text-[11px] text-faint">
                    {timestamp(selected.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selected.project_type ? <Badge tone="cyan">{selected.project_type}</Badge> : null}
                  {selected.budget ? <Badge>{selected.budget}</Badge> : null}
                  {!selected.is_read ? <Badge tone="ember">Unread</Badge> : null}
                </div>
              </div>
            </header>

            <div className="px-5 py-5">
              <p className="max-w-[62ch] whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                {selected.message}
              </p>
            </div>

            <footer className="flex flex-wrap items-center gap-2 border-t border-stroke px-5 py-4">
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(
                  `Re: ${selected.project_type ?? "your enquiry"}`
                )}`}
                className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-cyan px-4 text-[13px] font-medium text-[#04141a] transition-colors hover:bg-[#67e8f9]"
              >
                <Reply size={15} strokeWidth={1.5} />
                Reply by email
              </a>

              <form action={markMessageReadAction}>
                <input type="hidden" name="id" value={selected.id} />
                <Button type="submit" variant="outline" size="sm" className="h-9">
                  {selected.is_read ? (
                    <>
                      <Mail size={15} strokeWidth={1.5} />
                      Mark unread
                    </>
                  ) : (
                    <>
                      <MailOpen size={15} strokeWidth={1.5} />
                      Mark read
                    </>
                  )}
                </Button>
              </form>

              <div className="ml-auto">
                <ConfirmAction
                  action={deleteMessageAction}
                  id={selected.id}
                  iconOnly={false}
                  triggerLabel="Delete"
                  body={`Delete the message from ${selected.name}? It can't be recovered.`}
                />
              </div>
            </footer>
          </article>
        ) : (
          <EmptyState
            icon={Mail}
            title="Nothing selected"
            body="Pick a message on the left to read it in full."
          />
        )}
      </div>
    </div>
  );
}
