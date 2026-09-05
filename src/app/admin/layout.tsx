import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Pass-through. The auth guard and the sidebar live in <AdminShell>, which every
 * guarded page renders itself — that keeps /admin/login out of the guard and out
 * of a redirect loop.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
