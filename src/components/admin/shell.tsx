import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries";
import { AdminNav } from "./nav";

/**
 * Auth guard + chrome. Every guarded page renders this; /admin/login does not,
 * which is what keeps the redirect from looping.
 */
export async function AdminShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const stats = await getDashboardStats();

  return (
    <div className="relative min-h-screen bg-void">
      <AdminNav user={user} unread={stats.unread_messages} />

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 border-b border-stroke bg-void/85 backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 py-5 md:px-8">
            <div className="min-w-0">
              <h1 className="display-tight text-[22px] text-ink md:text-[26px]">{title}</h1>
              {description ? (
                <p className="mt-1 max-w-[62ch] text-[13px] text-muted">{description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-[2px] border border-stroke px-3 py-2 text-[13px] text-muted transition-colors hover:border-cyan/50 hover:text-cyan sm:inline-flex"
              >
                <ExternalLink size={14} strokeWidth={1.5} />
                <span className="display-tight">View site</span>
              </a>
              {action}
            </div>
          </div>
        </header>

        <main className="px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
