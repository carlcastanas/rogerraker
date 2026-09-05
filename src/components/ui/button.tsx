import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-cyan text-[#04141a] hover:bg-[#67e8f9] active:translate-y-px shadow-[0_0_0_1px_rgba(34,211,238,.4),0_10px_40px_-14px_rgba(34,211,238,.8)]",
        glass:
          "glass text-ink hover:bg-[rgba(245,245,247,.09)] hover:border-[rgba(34,211,238,.45)]",
        outline:
          "border border-stroke-strong bg-transparent text-ink hover:border-cyan/60 hover:text-cyan",
        ghost: "text-muted hover:text-ink hover:bg-[rgba(245,245,247,.05)]",
        danger:
          "border border-[#4a1d1d] bg-[#1a0c0c] text-[#ff8a8a] hover:border-[#7f2a2a] hover:text-[#ffb4b4]",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof Link> & VariantProps<typeof button>) {
  return <Link className={cn(button({ variant, size }), className)} {...props} />;
}

export { button as buttonStyles };
