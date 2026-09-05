"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { Select } from "@/components/ui/field";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "All";

const SORTS = [
  { value: "featured", label: "What I recommend first" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "rating", label: "Highest rated" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

/**
 * Pick the column count that leaves the fewest empty cells for this many
 * cards. Anything still left over is centred, so a filtered grid never ends
 * in an orphan card beside a void.
 */
function columnsFor(count: number) {
  if (count <= 2) return Math.max(count, 1);
  const waste = (cols: number) => (cols - (count % cols)) % cols;
  return waste(4) < waste(3) ? 4 : 3;
}

const CELL: Record<number, string> = {
  1: "w-full sm:max-w-[440px]",
  2: "w-full sm:w-[calc(50%_-_0.75rem)]",
  3: "w-full sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333%_-_1rem)]",
  4: "w-full sm:w-[calc(50%_-_0.75rem)] xl:w-[calc(25%_-_1.125rem)]",
};

export function StoreIndex({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState<string>(ALL);
  const [sort, setSort] = React.useState<SortValue>("featured");

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      if (!product.category) continue;
      map.set(product.category, (map.get(product.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const tabs = React.useMemo(
    () => [ALL, ...categories.filter((c, i) => categories.indexOf(c) === i)],
    [categories]
  );

  const visible = React.useMemo(() => {
    const filtered = active === ALL ? products : products.filter((p) => p.category === active);
    const withOrder = filtered.map((product, index) => ({ product, index }));

    withOrder.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return Number(a.product.price) - Number(b.product.price) || a.index - b.index;
        case "price-desc":
          return Number(b.product.price) - Number(a.product.price) || a.index - b.index;
        case "rating":
          return (
            Number(b.product.rating) - Number(a.product.rating) ||
            b.product.reviews_count - a.product.reviews_count ||
            a.index - b.index
          );
        default:
          return Number(b.product.featured) - Number(a.product.featured) || a.index - b.index;
      }
    });

    return withOrder.map((entry) => entry.product);
  }, [products, active, sort]);

  const cell = CELL[columnsFor(visible.length)] ?? CELL[3];

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-stroke pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter packs by kind"
          className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
        >
          {tabs.map((tab) => {
            const count = tab === ALL ? products.length : counts.get(tab) ?? 0;
            const isActive = tab === active;
            return (
              <button
                key={tab}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(tab)}
                className={cn(
                  "display-tight flex shrink-0 items-baseline gap-2 rounded-[2px] border px-3.5 py-2 text-[13px] transition-colors",
                  isActive
                    ? "border-cyan/50 bg-cyan/10 text-cyan"
                    : "border-stroke text-muted hover:border-stroke-strong hover:text-ink"
                )}
              >
                <span>{tab}</span>
                <span className={cn("tnum text-[11px]", isActive ? "text-cyan/70" : "text-faint")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="tnum hidden shrink-0 text-[13px] text-muted sm:inline">
            Showing {visible.length} of {products.length}
          </span>
          <label htmlFor="store-sort" className="label shrink-0">
            Sort
          </label>
          <div className="relative flex-1 sm:flex-none">
            <Select
              id="store-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortValue)}
              className="w-full sm:w-[220px]"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <ChevronDown
              size={15}
              strokeWidth={1.5}
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-faint"
            />
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="panel mt-8 px-6 py-14 text-center">
          <p className="display-tight text-lg text-ink">No {active} yet.</p>
          <p className="mx-auto mt-2.5 max-w-[52ch] text-[15px] leading-relaxed text-ink/70">
            Nothing in this one yet. Switch back to All to see everything that&apos;s up.
          </p>
          <button
            type="button"
            onClick={() => setActive(ALL)}
            className="display-tight mt-7 rounded-[2px] border border-stroke-strong px-4 py-2 text-[13px] text-ink transition-colors hover:border-cyan/60 hover:text-cyan"
          >
            Show everything
          </button>
        </div>
      ) : (
        <motion.div
          layout={!reduce}
          className="mt-8 flex flex-wrap justify-center gap-6 md:mt-10"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product) => (
              <motion.div
                key={product.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={cn("flex min-w-0", cell)}
              >
                <ProductCard product={product} className="w-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
