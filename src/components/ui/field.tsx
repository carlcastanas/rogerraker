import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-[2px] border border-stroke bg-[#0b0c10] px-3 text-sm text-ink placeholder:text-faint transition-colors hover:border-stroke-strong focus:border-cyan/70 focus:outline-none focus:ring-1 focus:ring-cyan/30 disabled:opacity-50";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, "h-10", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, "h-10 appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label className={cn("flex items-baseline justify-between gap-3 text-[13px] text-muted", className)} {...props}>
      <span>{children}</span>
      {hint ? <span className="text-[11px] text-faint">{hint}</span> : null}
    </label>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} hint={hint}>
        {label}
      </Label>
      {children}
    </div>
  );
}
