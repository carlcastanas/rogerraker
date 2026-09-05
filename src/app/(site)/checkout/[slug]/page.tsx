import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/queries";
import { CheckoutForm } from "@/components/store/checkout-form";
import { formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `Checkout: ${product.title}` : "Checkout",
    description: "Demo checkout for the Roger Raker toolkit.",
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_published) notFound();

  const price = Number(product.price);
  const compare = product.compare_at_price === null ? null : Number(product.compare_at_price);
  const saving = compare !== null && compare > price ? compare - price : null;

  return (
    <div className="shell pt-24 pb-20 md:pt-28 md:pb-28">
      <Link
        href={`/store/${product.slug}`}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-cyan"
      >
        <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
        Back to {product.title}
      </Link>

      <header className="mt-6">
        <h1 className="display text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink">Checkout</h1>
        <p className="mt-4 max-w-[54ch] text-[15px] leading-[1.75] text-ink/75">
          Two fields and you&apos;re done. The download link shows up right after, and updates to
          the pack are free.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <div className="min-w-0">
          <CheckoutForm product={product} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel rounded-[2px]">
            <div className="border-b border-stroke px-5 py-4">
              <h2 className="display-tight text-[15px] text-ink">What you&apos;re buying</h2>
            </div>

            <div className="flex gap-4 border-b border-stroke px-5 py-5">
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden border border-stroke">
                <Image
                  src={product.cover_image_url}
                  alt={`Cover for ${product.title}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="display-tight text-[14px] leading-snug text-ink">{product.title}</p>
                {product.format ? (
                  <p className="mt-1.5 text-[12px] leading-relaxed text-faint">{product.format}</p>
                ) : null}
              </div>
            </div>

            <dl className="px-5 py-4 text-[13px]">
              <div className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tnum text-ink">{formatPrice(compare ?? price)}</dd>
              </div>
              {saving !== null ? (
                <div className="flex items-baseline justify-between gap-4 py-1.5">
                  <dt className="text-muted">Discount</dt>
                  <dd className="tnum text-cyan">-{formatPrice(saving)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="text-muted">Tax</dt>
                <dd className="text-faint">Included</dd>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-stroke pt-4">
                <dt className="display-tight text-[15px] text-ink">Total</dt>
                <dd className="display tnum text-[22px] text-ink">{formatPrice(price)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
