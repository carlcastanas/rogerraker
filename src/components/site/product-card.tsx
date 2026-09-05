import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LutRamp } from "@/components/site/lut-ramp";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const href = `/store/${product.slug}`;
  const rating = Number(product.rating);
  const features = (product.features ?? []).slice(0, 3);

  return (
    <article
      className={cn(
        "panel group flex h-full flex-col rounded-[2px] transition-colors duration-300 hover:border-stroke-strong",
        className
      )}
    >
      {/* Covers are frames from the work the pack came off, always 16:9. */}
      <Link href={href} className="relative block aspect-video overflow-hidden bg-panel-2" tabIndex={-1} aria-hidden="true">
        <Image
          src={product.cover_image_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(8,8,10,.15) 45%, rgba(8,8,10,.78) 100%)",
          }}
        />
        {product.category ? (
          <Badge tone="default" className="absolute left-3 top-3 backdrop-blur-sm">
            {product.category}
          </Badge>
        ) : null}
      </Link>

      {/* The colour signature of the look, shadows to highlights. */}
      <LutRamp stops={product.ramp} />

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="display-tight text-[18px] leading-snug text-ink md:text-[20px]">
          <Link href={href} className="transition-colors hover:text-cyan">
            {product.title}
          </Link>
        </h3>

        {product.tagline ? (
          <p className="mt-2.5 max-w-[46ch] text-[14px] leading-[1.7] text-ink/75">
            {product.tagline}
          </p>
        ) : null}

        {features.length ? (
          <ul className="mt-4 space-y-2">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-2.5 text-[13px] leading-5 text-muted">
                <span aria-hidden="true" className="mt-[9px] h-px w-2.5 shrink-0 bg-stroke-strong" />
                {feature.title}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-stroke pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="display-tight tnum text-xl text-ink">{formatPrice(product.price)}</span>
              {product.compare_at_price ? (
                <span className="tnum text-[13px] text-faint line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] leading-5">
              <Star size={13} strokeWidth={1.5} className="fill-cyan text-cyan" />
              <span className="tnum text-ink">{Number.isFinite(rating) ? rating.toFixed(1) : "—"}</span>
              <span className="tnum text-muted">from {product.reviews_count} reviews</span>
            </div>
          </div>

          <Link
            href={href}
            className="display-tight shrink-0 rounded-[2px] border border-stroke-strong px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-cyan/60 hover:text-cyan"
          >
            View pack
          </Link>
        </div>
      </div>
    </article>
  );
}
