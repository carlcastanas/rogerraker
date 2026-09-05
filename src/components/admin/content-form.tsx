"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { resetSiteContentAction, saveSiteContentAction } from "@/lib/actions/content";
import { idleState } from "@/lib/actions/shared";
import type { SiteContent } from "@/lib/types";
import { CollapsibleSection } from "./collapsible-section";
import { FormError } from "./primitives";

const FORM_ID = "site-content-form";

type Row = { key: number; a: string; b: string };

let keySeed = 0;
const nextKey = () => {
  keySeed += 1;
  return keySeed;
};

function RepeatableRows({
  rows,
  setRows,
  nameA,
  nameB,
  labelA,
  labelB,
  placeholderA,
  placeholderB,
  multilineB = false,
  addLabel,
}: {
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  nameA: string;
  nameB: string;
  labelA: string;
  labelB: string;
  placeholderA: string;
  placeholderB: string;
  multilineB?: boolean;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={row.key} className="rounded-[2px] border border-stroke bg-[#0b0c10] p-3">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                name={nameA}
                value={row.a}
                aria-label={`${labelA} ${i + 1}`}
                placeholder={placeholderA}
                onChange={(e) =>
                  setRows((all) => all.map((r, idx) => (idx === i ? { ...r, a: e.target.value } : r)))
                }
              />
              {multilineB ? (
                <Textarea
                  name={nameB}
                  value={row.b}
                  rows={3}
                  aria-label={`${labelB} ${i + 1}`}
                  placeholder={placeholderB}
                  onChange={(e) =>
                    setRows((all) =>
                      all.map((r, idx) => (idx === i ? { ...r, b: e.target.value } : r))
                    )
                  }
                />
              ) : (
                <Input
                  name={nameB}
                  value={row.b}
                  aria-label={`${labelB} ${i + 1}`}
                  placeholder={placeholderB}
                  onChange={(e) =>
                    setRows((all) =>
                      all.map((r, idx) => (idx === i ? { ...r, b: e.target.value } : r))
                    )
                  }
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setRows((all) => all.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${labelA.toLowerCase()} ${i + 1}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-[#7f2a2a] hover:text-[#ff8a8a]"
            >
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((all) => [...all, { key: nextKey(), a: "", b: "" }])}
      >
        <Plus size={14} strokeWidth={1.5} />
        {addLabel}
      </Button>
    </div>
  );
}

function ResetControl() {
  const [open, setOpen] = React.useState(false);

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <RotateCcw size={14} strokeWidth={1.5} />
        Reset to defaults
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-muted">Replace every string with the shipped copy?</span>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <form action={resetSiteContentAction}>
        <Button type="submit" variant="danger" size="sm">
          Reset
        </Button>
      </form>
    </div>
  );
}

export function ContentForm({ content }: { content: SiteContent }) {
  const [state, action, pending] = useActionState(saveSiteContentAction, idleState);

  const [metrics, setMetrics] = React.useState<Row[]>(() =>
    content.about.metrics.map((m) => ({ key: nextKey(), a: m.value, b: m.label }))
  );
  const [process, setProcess] = React.useState<Row[]>(() =>
    content.about.process.map((p) => ({ key: nextKey(), a: p.title, b: p.body }))
  );

  return (
    <div className="pb-4">
      <form id={FORM_ID} action={action} className="space-y-4">
        <FormError>{state.error}</FormError>

        <CollapsibleSection
          title="Hero"
          description="The first screen: the headline, the two buttons, and the before/after frame."
          defaultOpen
        >
          <Field label="Eyebrow" htmlFor="hero.eyebrow">
            <Input id="hero.eyebrow" name="hero.eyebrow" defaultValue={content.hero.eyebrow} />
          </Field>
          <Field label="Headline" htmlFor="hero.headline">
            <Input id="hero.headline" name="hero.headline" defaultValue={content.hero.headline} />
          </Field>
          <Field label="Subhead" htmlFor="hero.subhead">
            <Textarea
              id="hero.subhead"
              name="hero.subhead"
              rows={3}
              defaultValue={content.hero.subhead}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary button" htmlFor="hero.primary_cta">
              <Input
                id="hero.primary_cta"
                name="hero.primary_cta"
                defaultValue={content.hero.primary_cta}
              />
            </Field>
            <Field label="Secondary button" htmlFor="hero.secondary_cta">
              <Input
                id="hero.secondary_cta"
                name="hero.secondary_cta"
                defaultValue={content.hero.secondary_cta}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Before image URL" htmlFor="hero.before_image">
              <Input
                id="hero.before_image"
                name="hero.before_image"
                defaultValue={content.hero.before_image}
              />
            </Field>
            <Field label="After image URL" htmlFor="hero.after_image">
              <Input
                id="hero.after_image"
                name="hero.after_image"
                defaultValue={content.hero.after_image}
              />
            </Field>
          </div>
          <Field label="Frame note" htmlFor="hero.frame_note" hint="Caption under the comparison">
            <Input
              id="hero.frame_note"
              name="hero.frame_note"
              defaultValue={content.hero.frame_note}
            />
          </Field>
        </CollapsibleSection>

        <CollapsibleSection title="Films" description="The heading above the films grid.">
          <Field label="Title" htmlFor="work.title">
            <Input id="work.title" name="work.title" defaultValue={content.work.title} />
          </Field>
          <Field label="Intro" htmlFor="work.intro">
            <Textarea id="work.intro" name="work.intro" rows={3} defaultValue={content.work.intro} />
          </Field>
        </CollapsibleSection>

        <CollapsibleSection title="Store" description="The heading and the download note in the store.">
          <Field label="Title" htmlFor="store.title">
            <Input id="store.title" name="store.title" defaultValue={content.store.title} />
          </Field>
          <Field label="Intro" htmlFor="store.intro">
            <Textarea
              id="store.intro"
              name="store.intro"
              rows={3}
              defaultValue={content.store.intro}
            />
          </Field>
          <Field label="Note" htmlFor="store.note" hint="Delivery and licensing line">
            <Textarea id="store.note" name="store.note" rows={2} defaultValue={content.store.note} />
          </Field>
        </CollapsibleSection>

        <CollapsibleSection
          title="About"
          description="The about section: the philosophy line, the process steps, and the numbers."
        >
          <Field label="Title" htmlFor="about.title">
            <Input id="about.title" name="about.title" defaultValue={content.about.title} />
          </Field>
          <Field label="Intro" htmlFor="about.intro">
            <Textarea
              id="about.intro"
              name="about.intro"
              rows={3}
              defaultValue={content.about.intro}
            />
          </Field>
          <Field label="Philosophy title" htmlFor="about.philosophy_title">
            <Input
              id="about.philosophy_title"
              name="about.philosophy_title"
              defaultValue={content.about.philosophy_title}
            />
          </Field>

          <div className="space-y-3 border-t border-stroke pt-5">
            <p className="label">Process steps</p>
            <RepeatableRows
              rows={process}
              setRows={setProcess}
              nameA="process_title"
              nameB="process_body"
              labelA="Step title"
              labelB="Step body"
              placeholderA="Write it down in one line"
              placeholderB="What happens at this step."
              multilineB
              addLabel="Add step"
            />
          </div>

          <div className="space-y-3 border-t border-stroke pt-5">
            <p className="label">Metrics</p>
            <RepeatableRows
              rows={metrics}
              setRows={setMetrics}
              nameA="metric_value"
              nameB="metric_label"
              labelA="Metric value"
              labelB="Metric label"
              placeholderA="1.52M"
              placeholderB="Subscribers on YouTube"
              addLabel="Add metric"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Contact"
          description="The enquiry form: its copy, the reply time, and the two dropdowns."
        >
          <Field label="Title" htmlFor="contact.title">
            <Input id="contact.title" name="contact.title" defaultValue={content.contact.title} />
          </Field>
          <Field label="Intro" htmlFor="contact.intro">
            <Textarea
              id="contact.intro"
              name="contact.intro"
              rows={3}
              defaultValue={content.contact.intro}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" htmlFor="contact.email">
              <Input
                id="contact.email"
                name="contact.email"
                type="email"
                defaultValue={content.contact.email}
              />
            </Field>
            <Field label="Response time" htmlFor="contact.response_time">
              <Input
                id="contact.response_time"
                name="contact.response_time"
                defaultValue={content.contact.response_time}
              />
            </Field>
          </div>
          <Field label="Project types" htmlFor="project_types" hint="One per line">
            <Textarea
              id="project_types"
              name="project_types"
              rows={6}
              defaultValue={content.contact.project_types.join("\n")}
            />
          </Field>
          <Field label="Budgets" htmlFor="budgets" hint="One per line">
            <Textarea
              id="budgets"
              name="budgets"
              rows={5}
              defaultValue={content.contact.budgets.join("\n")}
            />
          </Field>
        </CollapsibleSection>

        <CollapsibleSection title="Footer" description="The last two lines on every page.">
          <Field label="Tagline" htmlFor="footer.tagline">
            <Input id="footer.tagline" name="footer.tagline" defaultValue={content.footer.tagline} />
          </Field>
          <Field label="Legal" htmlFor="footer.legal">
            <Input id="footer.legal" name="footer.legal" defaultValue={content.footer.legal} />
          </Field>
        </CollapsibleSection>

        <CollapsibleSection
          title="Categories"
          description="The filters on the store and the work grid. They also fill the category dropdowns in the admin."
        >
          <Field label="Store categories" htmlFor="store_categories" hint="One per line">
            <Textarea
              id="store_categories"
              name="store_categories"
              rows={5}
              defaultValue={content.store_categories.join("\n")}
            />
          </Field>
          <Field label="Work categories" htmlFor="work_categories" hint="One per line">
            <Textarea
              id="work_categories"
              name="work_categories"
              rows={4}
              defaultValue={content.work_categories.join("\n")}
            />
          </Field>
        </CollapsibleSection>
      </form>

      <div className="sticky bottom-0 z-20 mt-4 flex flex-wrap items-center gap-3 border-t border-stroke bg-void/90 py-4 backdrop-blur-md">
        <div className="min-w-0 flex-1 text-[13px]">
          {state.error ? (
            <span className="text-[#ff8a8a]">{state.error}</span>
          ) : state.message ? (
            <span className="inline-flex items-center gap-1.5 text-cyan">
              <Check size={14} strokeWidth={1.5} />
              {state.message}
            </span>
          ) : (
            <span className="text-faint">
              Saving updates the public site right away.
            </span>
          )}
        </div>
        <ResetControl />
        <Button type="submit" form={FORM_ID} disabled={pending}>
          {pending ? "Saving…" : "Save site copy"}
        </Button>
      </div>
    </div>
  );
}
