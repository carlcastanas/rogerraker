import * as React from "react";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Square admin thumbnail. Plain <img>: cover URLs are free text, so they can
 *  point anywhere and next/image would refuse an un-allowlisted host. */
export function Thumb({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center overflow-hidden border border-stroke bg-panel-2",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <ImageIcon size={15} strokeWidth={1.5} className="text-faint" />
      )}
    </span>
  );
}

/** The LUT ramp strip — the same device the store cards use. */
export function RampStrip({ stops, className }: { stops: string[]; className?: string }) {
  const clean = stops.filter(Boolean);
  if (!clean.length) {
    return <span className={cn("block h-1.5 w-full bg-stroke", className)} aria-hidden />;
  }
  return (
    <span
      className={cn("block h-1.5 w-full", className)}
      aria-hidden
      style={{
        backgroundImage:
          clean.length === 1
            ? `linear-gradient(90deg, ${clean[0]}, ${clean[0]})`
            : `linear-gradient(90deg, ${clean.join(", ")})`,
      }}
    />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-[2px] border border-stroke bg-panel-2 text-faint">
        <Icon size={18} strokeWidth={1.5} />
      </span>
      <h3 className="display-tight text-[15px] text-ink">{title}</h3>
      <p className="max-w-[46ch] text-[13px] leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-[12px] text-[#ff8a8a]">{children}</p>;
}

export function FormError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-[2px] border border-[#4a1d1d] bg-[#1a0c0c] px-4 py-3 text-[13px] text-[#ff8a8a]"
    >
      {children}
    </div>
  );
}

/** Small hairline label used above dense admin blocks. */
export function BlockLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("label", className)}>{children}</p>;
}

const STATUS_TONE = {
  completed: "success",
  pending: "cyan",
  refunded: "ember",
  failed: "muted",
} as const;

export function OrderStatusBadge({ status }: { status: string }) {
  const tone = (STATUS_TONE as Record<string, "success" | "cyan" | "ember" | "muted">)[status] ?? "muted";
  return <Badge tone={tone}>{status}</Badge>;
}
