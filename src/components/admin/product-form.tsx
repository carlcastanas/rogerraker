"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { saveProductAction } from "@/lib/actions/products";
import { idleState } from "@/lib/actions/shared";
import type { Product, ProductFeature } from "@/lib/types";
import { formatPrice, slugify } from "@/lib/utils";
import { FormSection } from "./form-section";
import { FieldError, FormError, RampStrip } from "./primitives";

const DEFAULT_RAMP = ["#0a1620", "#154453", "#3f9fb5", "#d9d2c4"];
const HEX = /^#[0-9a-fA-F]{6}$/;

type FeatureRow = ProductFeature & { key: number };

let keySeed = 0;
const nextKey = () => {
  keySeed += 1;
  return keySeed;
};

export function ProductForm({
  product,
  categories,
}: {
  product?: Product | null;
  categories: string[];
}) {
  const [state, action, pending] = useActionState(saveProductAction, idleState);
  const errors = state.fieldErrors ?? {};

  const [title, setTitle] = React.useState(product?.title ?? "");
  const [slug, setSlug] = React.useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(product?.slug));
  const [tagline, setTagline] = React.useState(product?.tagline ?? "");
  const [price, setPrice] = React.useState(product ? String(product.price) : "");
  const [compareAt, setCompareAt] = React.useState(
    product?.compare_at_price != null ? String(product.compare_at_price) : ""
  );
  const [cover, setCover] = React.useState(product?.cover_image_url ?? "");
  const [category, setCategory] = React.useState(product?.category ?? "");
  const [customCategory, setCustomCategory] = React.useState(
    Boolean(product?.category && !categories.includes(product.category))
  );
  const [ramp, setRamp] = React.useState<string[]>(
    product?.ramp?.length ? product.ramp : DEFAULT_RAMP
  );
  const [features, setFeatures] = React.useState<FeatureRow[]>(() =>
    (product?.features ?? []).map((f) => ({ ...f, key: nextKey() }))
  );
  const [published, setPublished] = React.useState(product?.is_published ?? true);
  const [featured, setFeatured] = React.useState(product?.featured ?? false);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const priceNumber = Number(price);
  const compareNumber = Number(compareAt);

  function updateRamp(index: number, value: string) {
    setRamp((stops) => stops.map((s, i) => (i === index ? value : s)));
  }

  function moveFeature(index: number, delta: number) {
    setFeatures((rows) => {
      const target = index + delta;
      if (target < 0 || target >= rows.length) return rows;
      const copy = [...rows];
      const [row] = copy.splice(index, 1);
      copy.splice(target, 0, row);
      return copy;
    });
  }

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-6">
        <FormError>{state.error}</FormError>
        {product ? <input type="hidden" name="id" value={product.id} /> : null}

        <FormSection
          title="Identity"
          description="What the pack is called and how it reads on the store card."
        >
          <Field label="Title" htmlFor="title">
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kwento Grade LUTs"
              required
            />
            <FieldError>{errors.title}</FieldError>
          </Field>

          <Field label="Slug" htmlFor="slug" hint={`/store/${effectiveSlug || "…"}`}>
            <Input
              id="slug"
              name="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="kwento-grade-luts"
            />
            <FieldError>{errors.slug}</FieldError>
          </Field>

          <Field label="Tagline" htmlFor="tagline" hint="One line under the title">
            <Input
              id="tagline"
              name="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Twelve LUTs for Premiere, Resolve, and Final Cut."
            />
          </Field>

          <div className="space-y-2">
            <Label htmlFor="category" hint={customCategory ? "Free text" : "From site categories"}>
              Category
            </Label>
            <input type="hidden" name="category" value={category} />
            {customCategory ? (
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Presets"
              />
            ) : (
              <Select
                id="category"
                value={categories.includes(category) ? category : ""}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            )}
            <button
              type="button"
              onClick={() => setCustomCategory((v) => !v)}
              className="text-[12px] text-faint transition-colors hover:text-cyan"
            >
              {customCategory ? "Pick from the site categories instead" : "Type a new category instead"}
            </button>
          </div>

          <Field label="Description" htmlFor="description" hint="Shown on the product page">
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              rows={6}
              placeholder="What the buyer gets, what you made it for, and how it behaves on their footage."
              required
            />
            <FieldError>{errors.description}</FieldError>
          </Field>
        </FormSection>

        <FormSection title="Price" description="Set compare-at above price to show a strike-through.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price" htmlFor="price" hint="0 for free">
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1490"
                required
              />
              <FieldError>{errors.price}</FieldError>
            </Field>
            <Field label="Compare at price" htmlFor="compare_at_price" hint="Optional">
              <Input
                id="compare_at_price"
                name="compare_at_price"
                type="number"
                min="0"
                step="0.01"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                placeholder="1990"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Media" description="Cover image and the gallery on the product page.">
          <Field label="Cover image URL" htmlFor="cover_image_url">
            <Input
              id="cover_image_url"
              name="cover_image_url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://…/photo.jpg"
              required
            />
            <FieldError>{errors.cover_image_url}</FieldError>
          </Field>
          <Field label="Gallery URLs" htmlFor="gallery_urls" hint="One per line">
            <Textarea
              id="gallery_urls"
              name="gallery_urls"
              rows={4}
              defaultValue={(product?.gallery_urls ?? []).join("\n")}
              placeholder={"https://…\nhttps://…"}
            />
          </Field>
        </FormSection>

        <FormSection
          title="LUT ramp"
          description="The colour stops drawn as the strip on the card. Left to right, shadows to highlights."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRamp((s) => [...s, "#8a8a90"])}
            >
              <Plus size={14} strokeWidth={1.5} />
              Add stop
            </Button>
          }
        >
          <input type="hidden" name="ramp" value={ramp.join("\n")} />

          <div>
            <p className="label mb-2">Preview</p>
            <RampStrip stops={ramp.filter((s) => HEX.test(s))} className="h-8" />
          </div>

          {ramp.length ? (
            <ul className="space-y-2">
              {ramp.map((stop, i) => (
                <li key={`ramp-${i}`} className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`Colour stop ${i + 1}`}
                    value={HEX.test(stop) ? stop : "#000000"}
                    onChange={(e) => updateRamp(i, e.target.value)}
                    className="h-9 w-11 shrink-0 cursor-pointer rounded-[2px] border border-stroke bg-[#0b0c10] p-1"
                  />
                  <Input
                    value={stop}
                    onChange={(e) => updateRamp(i, e.target.value)}
                    aria-label={`Hex for stop ${i + 1}`}
                    className="tnum h-9"
                    placeholder="#22d3ee"
                  />
                  <button
                    type="button"
                    onClick={() => setRamp((s) => s.filter((_, idx) => idx !== i))}
                    aria-label={`Remove stop ${i + 1}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-[#7f2a2a] hover:text-[#ff8a8a]"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-faint">
              No stops yet. The card falls back to a flat hairline.
            </p>
          )}
        </FormSection>

        <FormSection title="Delivery" description="What the buyer downloads and what it runs in.">
          <Field label="File URL" htmlFor="file_url" hint="Optional">
            <Input
              id="file_url"
              name="file_url"
              defaultValue={product?.file_url ?? ""}
              placeholder="https://downloads.rogerraker.com/kwento-grade-luts.zip"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Format" htmlFor="format">
              <Input
                id="format"
                name="format"
                defaultValue={product?.format ?? ""}
                placeholder=".cube, .look, PDF guide"
              />
            </Field>
            <Field label="Software" htmlFor="software">
              <Input
                id="software"
                name="software"
                defaultValue={product?.software ?? ""}
                placeholder="DaVinci Resolve 18+, Premiere Pro"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Features"
          description="The bullet list on the product page. Order is the order shown."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFeatures((rows) => [...rows, { title: "", detail: "", key: nextKey() }])
              }
            >
              <Plus size={14} strokeWidth={1.5} />
              Add feature
            </Button>
          }
        >
          {features.length ? (
            <ul className="space-y-3">
              {features.map((row, i) => (
                <li key={row.key} className="rounded-[2px] border border-stroke bg-[#0b0c10] p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input
                        name="feature_title"
                        value={row.title}
                        onChange={(e) =>
                          setFeatures((rows) =>
                            rows.map((r, idx) => (idx === i ? { ...r, title: e.target.value } : r))
                          )
                        }
                        aria-label={`Feature ${i + 1} title`}
                        placeholder="12 LUTs"
                      />
                      <Input
                        name="feature_detail"
                        value={row.detail}
                        onChange={(e) =>
                          setFeatures((rows) =>
                            rows.map((r, idx) => (idx === i ? { ...r, detail: e.target.value } : r))
                          )
                        }
                        aria-label={`Feature ${i + 1} detail`}
                        placeholder="Each one at full and half strength."
                      />
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveFeature(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move feature ${i + 1} up`}
                        className="grid h-8 w-8 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/50 hover:text-cyan disabled:opacity-30"
                      >
                        <ArrowUp size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFeature(i, 1)}
                        disabled={i === features.length - 1}
                        aria-label={`Move feature ${i + 1} down`}
                        className="grid h-8 w-8 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/50 hover:text-cyan disabled:opacity-30"
                      >
                        <ArrowDown size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeatures((rows) => rows.filter((_, idx) => idx !== i))}
                        aria-label={`Remove feature ${i + 1}`}
                        className="grid h-8 w-8 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-[#7f2a2a] hover:text-[#ff8a8a]"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-faint">
              No features yet. Three or four short lines read better than a paragraph.
            </p>
          )}
        </FormSection>

        <FormSection
          title="Rating and sales"
          description="Shown on the card and the product page. The sales count also moves on every checkout."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Rating" htmlFor="rating" hint="0–5">
              <Input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={product ? String(product.rating) : "5"}
              />
            </Field>
            <Field label="Reviews" htmlFor="reviews_count">
              <Input
                id="reviews_count"
                name="reviews_count"
                type="number"
                min="0"
                step="1"
                defaultValue={product ? String(product.reviews_count) : "0"}
              />
            </Field>
            <Field label="Sales" htmlFor="sales_count">
              <Input
                id="sales_count"
                name="sales_count"
                type="number"
                min="0"
                step="1"
                defaultValue={product ? String(product.sales_count) : "0"}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Publishing" description="Visibility and where it sits in the grid.">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={published}
                onChange={setPublished}
                name="is_published"
                label="Published"
              />
              <span className="text-[13px] text-muted">
                {published ? "Live in the store" : "Draft, hidden from the store"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={featured} onChange={setFeatured} name="featured" label="Featured" />
              <span className="text-[13px] text-muted">Featured</span>
            </div>
          </div>
          <Field label="Sort order" htmlFor="sort_order" hint="Lower sorts first">
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              step="1"
              defaultValue={product ? String(product.sort_order) : "0"}
              className="max-w-[140px]"
            />
          </Field>
        </FormSection>

        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-stroke bg-void/90 py-4 backdrop-blur-md">
          <Link
            href="/admin/products"
            className="display-tight px-3 py-2 text-[13px] text-muted transition-colors hover:text-ink"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>

      {/* Live card preview */}
      <aside className="min-w-0">
        <div className="xl:sticky xl:top-[7.5rem]">
          <p className="label mb-2">Store card preview</p>
          <div className="panel overflow-hidden rounded-[2px]">
            <div className="relative aspect-[4/3] bg-panel-2">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-[12px] text-faint">
                  Cover image
                </span>
              )}
              <div className="absolute left-3 top-3 flex gap-1.5">
                {category ? <Badge tone="cyan">{category}</Badge> : null}
                {featured ? <Badge tone="ember">Featured</Badge> : null}
              </div>
              {!published ? (
                <div className="absolute right-3 top-3">
                  <Badge tone="muted">Draft</Badge>
                </div>
              ) : null}
            </div>
            <RampStrip stops={ramp.filter((s) => HEX.test(s))} />
            <div className="p-4">
              <h3 className="display-tight text-[16px] text-ink">{title || "Untitled product"}</h3>
              {tagline ? (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{tagline}</p>
              ) : null}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="display-tight tnum text-[18px] text-ink">
                  {formatPrice(Number.isFinite(priceNumber) && price !== "" ? priceNumber : 0)}
                </span>
                {compareAt && Number.isFinite(compareNumber) && compareNumber > priceNumber ? (
                  <span className="tnum text-[13px] text-faint line-through">
                    {formatPrice(compareNumber)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-faint">
            A rough read of the store card. The real one uses the same cover, badge, ramp, and price.
          </p>
        </div>
      </aside>
    </form>
  );
}
