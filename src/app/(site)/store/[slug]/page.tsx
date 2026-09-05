import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/site/product-card";
import { BuyPanel } from "@/components/store/buy-panel";
import { ProductGallery } from "@/components/store/product-gallery";

type Props = { params: Promise<{ slug: string }> };

function galleryFor(cover: string, extra: string[]) {
  return [cover, ...extra].filter((url, i, all) => Boolean(url) && all.indexOf(url) === i);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_published) {
    return { title: "Pack not found" };
  }
  const description = product.tagline ?? product.description.slice(0, 180);
  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      type: "website",
      images: [{ url: product.cover_image_url, alt: `Cover for ${product.title}` }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_published) notFound();

  const related = await getRelatedProducts(product.id, product.category, 3);
  const images = galleryFor(product.cover_image_url, product.gallery_urls ?? []);
  const features = product.features ?? [];

  return (
    <div className="shell pt-24 pb-20 md:pt-28 md:pb-28">
      <Link
        href="/store"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-cyan"
      >
        <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
        The toolkit
      </Link>

      <header className="mt-6 max-w-[62ch]">
        <div className="flex flex-wrap items-center gap-2">
          {product.category ? <Badge tone="muted">{product.category}</Badge> : null}
          {product.featured ? <Badge tone="cyan">One of my most used</Badge> : null}
        </div>
        <h1 className="display mt-3 text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink">
          {product.title}
        </h1>
        {product.tagline ? (
          <p className="mt-4 text-[15px] leading-[1.75] text-ink/75 md:text-base">
            {product.tagline}
          </p>
        ) : null}
      </header>

      <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <ProductGallery images={images} ramp={product.ramp ?? []} title={product.title} />
        </div>

        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
          <BuyPanel product={product} />
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <section>
            <h2 className="display-tight border-b border-stroke pb-3 text-[15px] text-ink">
              What it is
            </h2>
            <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.8] text-ink/80 md:text-[17px]">
              {product.description}
            </p>
          </section>

          {features.length > 0 ? (
            <section className="mt-14 md:mt-16">
              <h2 className="display-tight border-b border-stroke pb-3 text-[15px] text-ink">
                What you get
              </h2>
              <ul>
                {features.map((feature) => (
                  <li
                    key={feature.title}
                    className="flex gap-4 border-b border-stroke py-5 last:border-b-0"
                  >
                    <Check
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-cyan"
                    />
                    <div className="min-w-0">
                      <h3 className="display-tight text-[15px] text-ink">{feature.title}</h3>
                      <p className="mt-1.5 max-w-[62ch] text-[14px] leading-[1.7] text-ink/75">
                        {feature.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20 md:mt-28">
          <div className="flex items-baseline justify-between gap-4 border-b border-stroke pb-3">
            <h2 className="display-tight text-[15px] text-ink">Related packs</h2>
            <Link
              href="/store"
              className="text-[13px] text-muted transition-colors hover:text-cyan"
            >
              See everything
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {related.map((item) => (
              <div
                key={item.id}
                className="flex w-full min-w-0 sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333%_-_1rem)]"
              >
                <ProductCard product={item} className="w-full" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
