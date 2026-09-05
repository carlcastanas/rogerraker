import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { ProjectTable } from "@/components/admin/project-table";
import { NoticeStrip } from "@/components/admin/notice";
import { ButtonLink } from "@/components/ui/button";
import { getProjects, getSiteContent } from "@/lib/queries";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  saved: "Project saved. The films page is already showing the change.",
  deleted: "Project deleted.",
};

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const [projects, content] = await Promise.all([getProjects(), getSiteContent()]);
  const noticeKey = Object.keys(NOTICES).find((key) => params[key] === "1");

  return (
    <AdminShell
      title="Projects"
      description="The films and vlogs on the site. Publishing one puts it straight on the films page."
      action={
        <ButtonLink href="/admin/projects/new">
          <Plus size={15} strokeWidth={1.5} />
          New project
        </ButtonLink>
      }
    >
      {noticeKey ? <NoticeStrip>{NOTICES[noticeKey]}</NoticeStrip> : null}
      <ProjectTable projects={projects} categories={content.work_categories} />
    </AdminShell>
  );
}
