import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { ProductTable } from "@/components/admin/product-table";
import { NoticeStrip } from "@/components/admin/notice";
import { ButtonLink } from "@/components/ui/button";
import { getProducts, getSiteContent } from "@/lib/queries";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  saved: "Product saved. The store is already showing the change.",
  deleted: "Product deleted, along with its orders.",
  duplicated: "Copy created as a draft. Rename it and publish when it's ready.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const [products, content] = await Promise.all([getProducts(), getSiteContent()]);

  const noticeKey = Object.keys(NOTICES).find((key) => params[key] === "1");

  return (
    <AdminShell
      title="Products"
      description="Every pack in the store. Switch one live, duplicate one as a starting point, or edit the full record."
      action={
        <ButtonLink href="/admin/products/new">
          <Plus size={15} strokeWidth={1.5} />
          New product
        </ButtonLink>
      }
    >
      {noticeKey ? <NoticeStrip>{NOTICES[noticeKey]}</NoticeStrip> : null}
      <ProductTable products={products} categories={content.store_categories} />
    </AdminShell>
  );
}
