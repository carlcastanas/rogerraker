"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Receipt,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/lib/actions/auth";
import type { AdminUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/messages", label: "Messages", icon: Mail, badge: "unread" as const },
  { href: "/admin/content", label: "Site content", icon: FileText },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  pathname,
  unread,
  onNavigate,
}: {
  pathname: string;
  unread: number;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-px p-2">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-[2px] border-l-2 px-3 py-2 text-[13px] transition-colors",
              active
                ? "border-cyan bg-cyan/[0.07] text-cyan"
                : "border-transparent text-muted hover:bg-[rgba(245,245,247,.04)] hover:text-ink"
            )}
          >
            <Icon size={16} strokeWidth={1.5} className="shrink-0" />
            <span className="display-tight flex-1 truncate">{item.label}</span>
            {item.badge === "unread" && unread > 0 ? (
              <Badge tone="cyan" className="tnum px-1.5">
                {unread}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function Identity({ user }: { user: AdminUser }) {
  return (
    <div className="border-t border-stroke p-3">
      <div className="flex items-center gap-3 px-1 pb-3">
        <span className="display-tight grid h-8 w-8 shrink-0 place-items-center rounded-[2px] border border-stroke-strong bg-panel-2 text-[13px] text-cyan">
          {(user.name ?? user.email).slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] text-ink">{user.name ?? "Admin"}</span>
          <span className="block truncate text-[11px] text-faint">{user.email}</span>
        </span>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-[2px] border border-stroke px-3 py-2 text-[13px] text-muted transition-colors hover:border-stroke-strong hover:text-ink"
        >
          <LogOut size={15} strokeWidth={1.5} />
          <span className="display-tight">Sign out</span>
        </button>
      </form>
    </div>
  );
}

export function AdminNav({ user, unread }: { user: AdminUser; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-stroke bg-panel md:flex">
        <Link
          href="/admin"
          className="flex items-baseline gap-2 border-b border-stroke px-4 py-4"
        >
          <span className="display text-[17px] text-ink">Roger Raker</span>
          <span className="label text-[10px]">admin</span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavList pathname={pathname} unread={unread} />
        </div>
        <Identity user={user} />
      </aside>

      {/* Mobile bar */}
      <div className="border-b border-stroke bg-panel md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="display text-[16px] text-ink">Roger Raker</span>
            <span className="label text-[10px]">admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-9 w-9 place-items-center rounded-[2px] border border-stroke text-muted hover:text-ink"
          >
            {open ? <X size={17} strokeWidth={1.5} /> : <Menu size={17} strokeWidth={1.5} />}
          </button>
        </div>
        {open ? (
          <div id="admin-mobile-nav" className="border-t border-stroke">
            <NavList pathname={pathname} unread={unread} onNavigate={() => setOpen(false)} />
            <Identity user={user} />
          </div>
        ) : null}
      </div>
    </>
  );
}
