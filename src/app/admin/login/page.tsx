import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/** Standalone — deliberately not wrapped in <AdminShell>, so the guard in the
 *  shell can redirect here without looping. */
export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-void px-5 py-16">
      <div className="relative z-10 w-full max-w-[380px]">
        <div className="mb-7">
          <span className="label">Admin</span>
          <h1 className="display mt-2 text-[34px] text-ink">Roger Raker</h1>
          <p className="mt-2 text-[13px] text-muted">
            Sign in to edit the store, the films, and the copy on the site.
          </p>
        </div>

        <div className="panel rounded-[2px] p-6">
          <LoginForm />
        </div>

        <p className="mt-4 rounded-[2px] border border-stroke bg-panel px-4 py-3 text-[12px] leading-relaxed text-faint">
          Demo build. Sign in with{" "}
          <span className="text-muted">roger@rogerraker.com</span> and{" "}
          <span className="tnum text-muted">Grade2026!</span>
        </p>

        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-faint transition-colors hover:text-cyan"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to the site
        </Link>
      </div>
    </div>
  );
}
