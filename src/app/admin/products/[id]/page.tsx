import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById, getSiteContent } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, content] = await Promise.all([getProductById(id), getSiteContent()]);
  if (!product) notFound();

  return (
    <AdminShell
      title={product.title}
      description={`Last updated ${formatDate(product.updated_at)} · ${
        product.is_published ? "live in the store" : "draft"
      }`}
      action={
        product.is_published ? (
          <a
            href={`/store/${product.slug}`}
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
      <ProductForm product={product} categories={content.store_categories} />
    </AdminShell>
  );
}
