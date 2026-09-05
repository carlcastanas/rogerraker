import { Download, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

/**
 * The one action on the page. Title and tagline live in the page header, so
 * this panel only carries price, proof, and the specs you check before buying.
 */
export function BuyPanel({ product }: { product: Product }) {
  const price = Number(product.price);
  const compare = product.compare_at_price === null ? null : Number(product.compare_at_price);
  const saving = compare !== null && compare > price ? compare - price : null;

  const specs = [
    { term: "Format", detail: product.format },
    { term: "Works in", detail: product.software },
    { term: "Kind", detail: product.category },
  ].filter((spec): spec is { term: string; detail: string } => Boolean(spec.detail));

  return (
    <div className="panel rounded-[2px]">
      <div className="px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="display tnum text-[clamp(1.75rem,3vw,2.25rem)] text-ink">
            {formatPrice(price)}
          </span>
          {compare !== null && compare > price ? (
            <span className="tnum text-[15px] text-faint line-through">{formatPrice(compare)}</span>
          ) : null}
          {saving !== null ? (
            <Badge tone="cyan" className="tnum">
              Save {formatPrice(saving)}
            </Badge>
          ) : null}
        </div>

        <ButtonLink
          href={`/checkout/${product.slug}`}
          variant="primary"
          size="lg"
          className="mt-5 w-full"
        >
          Get this pack
        </ButtonLink>

        <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-faint">
          <Download size={14} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0" />
          The download link shows up right after your order goes through.
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-px border-y border-stroke bg-stroke">
        <div className="bg-panel px-4 py-3">
          <dt className="label">Rating</dt>
          <dd className="mt-1.5 flex items-center gap-1.5 text-sm text-ink">
            <Star size={14} strokeWidth={1.5} className="fill-cyan text-cyan" aria-hidden />
            <span className="tnum">{Number(product.rating).toFixed(1)}</span>
          </dd>
        </div>
        <div className="bg-panel px-4 py-3">
          <dt className="label">Reviews</dt>
          <dd className="tnum mt-1.5 text-sm text-ink">
            {product.reviews_count.toLocaleString("en-PH")}
          </dd>
        </div>
        <div className="bg-panel px-4 py-3">
          <dt className="label">Sold</dt>
          <dd className="tnum mt-1.5 text-sm text-ink">
            {product.sales_count.toLocaleString("en-PH")}
          </dd>
        </div>
      </dl>

      {specs.length > 0 ? (
        <dl>
          {specs.map((spec) => (
            <div
              key={spec.term}
              className="flex gap-4 border-b border-stroke px-5 py-3.5 last:border-b-0 md:px-6"
            >
              <dt className="label w-20 shrink-0 pt-0.5">{spec.term}</dt>
              <dd className="min-w-0 flex-1 text-[13px] leading-[1.6] text-ink/75">
                {spec.detail}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
