import { ArrowUpRight, Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { SectionHead } from "@/components/site/section-head";
import type { Product, SiteContent } from "@/lib/types";

export function StoreSection({
  content,
  products,
}: {
  content: SiteContent["store"];
  products: Product[];
}) {
  return (
    <section id="store" className="scroll-mt-24 border-y border-stroke bg-panel/40 py-20 md:py-28">
      <div className="shell">
        <SectionHead
          index=""
          title={content.title}
          intro={content.intro}
          action={
            <ButtonLink href="/store" variant="outline" size="md" className="display-tight">
              Every pack
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </ButtonLink>
          }
        />

        {products.length ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-[15px] leading-[1.75] text-ink/80">
            No packs up yet. I&apos;m still working on them.
          </p>
        )}

        <p className="mt-6 flex items-start gap-2.5 text-[14px] leading-[1.7] text-muted">
          <Download size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-cyan" />
          <span className="max-w-[62ch]">{content.note}</span>
        </p>
      </div>
    </section>
  );
}
