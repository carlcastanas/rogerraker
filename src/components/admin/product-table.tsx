"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Package, Pencil, Plus, Search, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import {
  deleteProductAction,
  duplicateProductAction,
  toggleProductPublishedAction,
} from "@/lib/actions/products";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ConfirmAction } from "./confirm-action";
import { EmptyState, RampStrip, Thumb } from "./primitives";
import { PublishToggle } from "./publish-toggle";

function RowActions({ product }: { product: Product }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/products/${product.id}`}
        aria-label={`Edit ${product.title}`}
        className="grid h-8 w-8 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
      >
        <Pencil size={15} strokeWidth={1.5} />
      </Link>

      <form action={duplicateProductAction}>
        <input type="hidden" name="id" value={product.id} />
        <button
          type="submit"
          aria-label={`Duplicate ${product.title}`}
          className="grid h-8 w-8 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
        >
          <Copy size={15} strokeWidth={1.5} />
        </button>
      </form>

      <ConfirmAction
        action={deleteProductAction}
        id={product.id}
        triggerLabel={`Delete ${product.title}`}
        body={`Delete "${product.title}" for good? Its orders are removed with it.`}
      />
    </div>
  );
}

export function ProductTable({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [term, setTerm] = React.useState("");
  const [category, setCategory] = React.useState("all");

  const options = React.useMemo(() => {
    const set = new Set(categories.filter(Boolean));
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [categories, products]);

  const filtered = React.useMemo(() => {
    const q = term.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && (p.category ?? "") !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.tagline ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, term, category]);

  if (!products.length) {
    return (
      <div className="panel rounded-[2px]">
        <EmptyState
          icon={Package}
          title="No packs yet"
          body="Add the first pack, like a LUT set or a template kit. It shows up in the store as soon as you publish it."
          action={
            <ButtonLink href="/admin/products/new">
              <Plus size={15} strokeWidth={1.5} />
              New product
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <div className="panel rounded-[2px]">
      <div className="flex flex-wrap items-center gap-3 border-b border-stroke px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search title, slug, or tagline"
            aria-label="Search products"
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="w-auto min-w-[160px]"
        >
          <option value="all">All categories</option>
          {options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <p className="tnum ml-auto text-[12px] text-faint">
          {filtered.length} of {products.length}
        </p>
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={Search}
          title="Nothing matches"
          body="No product matches that search and filter. Clear one of them to see the rest."
        />
      ) : (
        <>
          {/* Table, md and up */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="label px-4 py-2.5 font-normal">Product</th>
                  <th className="label px-4 py-2.5 font-normal">Category</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Price</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Sales</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Rating</th>
                  <th className="label px-4 py-2.5 font-normal">Published</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[rgba(245,245,247,.02)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb src={p.cover_image_url} alt="" />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="display-tight block max-w-[30ch] truncate text-[14px] text-ink transition-colors hover:text-cyan"
                          >
                            {p.title}
                          </Link>
                          <span className="block max-w-[30ch] truncate text-[11px] text-faint">
                            /store/{p.slug}
                          </span>
                          <RampStrip stops={p.ramp ?? []} className="mt-1.5 max-w-[120px]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted">{p.category ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="tnum block text-[13px] text-ink">{formatPrice(p.price)}</span>
                      {p.compare_at_price ? (
                        <span className="tnum block text-[11px] text-faint line-through">
                          {formatPrice(p.compare_at_price)}
                        </span>
                      ) : null}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-[13px] text-muted">
                      {p.sales_count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="tnum inline-flex items-center justify-end gap-1 text-[13px] text-muted">
                        <Star size={13} strokeWidth={1.5} className="text-cyan" />
                        {Number(p.rating).toFixed(1)}
                        <span className="text-faint">({p.reviews_count})</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PublishToggle
                        id={p.id}
                        published={p.is_published}
                        toggle={toggleProductPublishedAction}
                        label={p.title}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions product={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stacked cards, below md */}
          <ul className="divide-y divide-stroke md:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Thumb src={p.cover_image_url} alt="" className="h-14 w-14" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="display-tight block truncate text-[14px] text-ink"
                    >
                      {p.title}
                    </Link>
                    <span className="block truncate text-[11px] text-faint">/store/{p.slug}</span>
                    <RampStrip stops={p.ramp ?? []} className="mt-2" />
                  </div>
                </div>
                <dl className="tnum mt-3 grid grid-cols-4 gap-2 text-[12px]">
                  <div>
                    <dt className="label">Price</dt>
                    <dd className="mt-0.5 text-ink">{formatPrice(p.price)}</dd>
                  </div>
                  <div>
                    <dt className="label">Sales</dt>
                    <dd className="mt-0.5 text-muted">{p.sales_count}</dd>
                  </div>
                  <div>
                    <dt className="label">Rating</dt>
                    <dd className="mt-0.5 text-muted">{Number(p.rating).toFixed(1)}</dd>
                  </div>
                  <div>
                    <dt className="label">Category</dt>
                    <dd className="mt-0.5 truncate text-muted">{p.category ?? "—"}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <PublishToggle
                    id={p.id}
                    published={p.is_published}
                    toggle={toggleProductPublishedAction}
                    label={p.title}
                  />
                  <RowActions product={p} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
