import { AdminShell } from "@/components/admin/shell";
import { ProjectForm } from "@/components/admin/project-form";
import { getSiteContent } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const content = await getSiteContent();

  return (
    <AdminShell
      title="New project"
      description="Cover frame, credits, and the scope line that runs under the title."
    >
      <ProjectForm categories={content.work_categories} />
    </AdminShell>
  );
}
