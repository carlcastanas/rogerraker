"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Three places to go, and one thing to do. */
const LINKS = [
  { href: "/work", label: "Films" },
  { href: "/store", label: "Toolkit" },
  { href: "/#about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [lifted, setLifted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close the sheet when the route changes, adjusted during render. */
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        lifted || open ? "border-b border-stroke bg-void/80 backdrop-blur-xl" : "border-b border-transparent"
      )}
    >
      <nav className="shell flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link
          href="/"
          className="display-tight flex items-baseline gap-2 text-[16px] text-ink"
          aria-label="Roger Raker, home"
        >
          <span className="h-1.5 w-1.5 translate-y-[-2px] bg-cyan" aria-hidden="true" />
          Roger Raker
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "display-tight rounded-[2px] px-3 py-2 text-[13px] transition-colors",
                isActive(link.href) ? "text-cyan" : "text-muted hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ButtonLink
            href="/#contact"
            variant="primary"
            size="sm"
            className="display-tight hidden sm:inline-flex"
          >
            Work with me
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-stroke-strong hover:text-ink md:hidden"
          >
            {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      <div
        id="site-nav-menu"
        hidden={!open}
        className="border-t border-stroke bg-void/95 backdrop-blur-xl md:hidden"
      >
        <div className="shell flex flex-col py-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "display-tight border-b border-stroke py-4 text-lg",
                isActive(link.href) ? "text-cyan" : "text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setOpen(false)}
            className="display-tight py-4 text-lg text-cyan"
          >
            Work with me
          </Link>
        </div>
      </div>
    </header>
  );
}
