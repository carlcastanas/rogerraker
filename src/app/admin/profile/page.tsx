import { AdminShell } from "@/components/admin/shell";
import { ProfileForm } from "@/components/admin/profile-form";
import { getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <AdminShell
      title="Profile"
      description="Name, bio, socials, and gear list. The about section on the site reads from here."
    >
      <ProfileForm profile={profile} />
    </AdminShell>
  );
}
