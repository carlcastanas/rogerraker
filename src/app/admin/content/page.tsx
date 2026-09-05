import { AdminShell } from "@/components/admin/shell";
import { ContentForm } from "@/components/admin/content-form";
import { NoticeStrip } from "@/components/admin/notice";
import { getSiteContent } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, content] = await Promise.all([searchParams, getSiteContent()]);

  return (
    <AdminShell
      title="Site content"
      description="Every line of copy on the public site, in the order it appears. Changes go live on save."
    >
      {params.reset === "1" ? (
        <NoticeStrip>Site copy is back to the shipped defaults.</NoticeStrip>
      ) : null}
      <ContentForm content={content} />
    </AdminShell>
  );
}
