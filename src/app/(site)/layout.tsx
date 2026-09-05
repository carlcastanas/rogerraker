import * as React from "react";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";

/**
 * Every public page reads the database, and the admin panel can change that
 * content at any moment, so the site renders per request rather than being
 * prerendered at build time. It also keeps `next build` from needing a database,
 * which is what lets CI build the app before it deploys.
 */
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
