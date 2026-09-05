import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { ProjectForm } from "@/components/admin/project-form";
import { getProjectById, getSiteContent } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, content] = await Promise.all([getProjectById(id), getSiteContent()]);
  if (!project) notFound();

  return (
    <AdminShell
      title={project.title}
      description={`Last updated ${formatDate(project.updated_at)} · ${
        project.is_published ? "live on the films page" : "draft"
      }`}
      action={
        project.is_published ? (
          <a
            href={`/work/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-stroke px-3 py-2 text-[13px] text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
          >
            <ExternalLink size={14} strokeWidth={1.5} />
            <span className="display-tight">Open page</span>
          </a>
        ) : null
      }
    >
      <ProjectForm project={project} categories={content.work_categories} />
    </AdminShell>
  );
}
