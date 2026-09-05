import { AdminShell } from "@/components/admin/shell";
import { ProductForm } from "@/components/admin/product-form";
import { getSiteContent } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const content = await getSiteContent();

  return (
    <AdminShell
      title="New product"
      description="Everything the store page needs: copy, price, ramp, and the file the buyer downloads."
    >
      <ProductForm categories={content.store_categories} />
    </AdminShell>
  );
}
