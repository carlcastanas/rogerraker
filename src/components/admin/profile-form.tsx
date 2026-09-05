"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { saveProfileAction } from "@/lib/actions/content";
import { idleState } from "@/lib/actions/shared";
import type { Profile } from "@/lib/types";
import { FormSection } from "./form-section";
import { FieldError, FormError } from "./primitives";

type GearRow = { key: number; label: string; items: string };

let keySeed = 0;
const nextKey = () => {
  keySeed += 1;
  return keySeed;
};

const SOCIALS = [
  { name: "social_x", label: "X", key: "x", placeholder: "https://x.com/rogerraker" },
  {
    name: "social_instagram",
    label: "Instagram",
    key: "instagram",
    placeholder: "https://instagram.com/rogerraker",
  },
  {
    name: "social_youtube",
    label: "YouTube",
    key: "youtube",
    placeholder: "https://youtube.com/@rogerraker",
  },
  { name: "social_github", label: "GitHub", key: "github", placeholder: "https://github.com/rogerraker" },
  {
    name: "social_linkedin",
    label: "LinkedIn",
    key: "linkedin",
    placeholder: "https://linkedin.com/in/rogerraker",
  },
] as const;

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState(saveProfileAction, idleState);
  const errors = state.fieldErrors ?? {};

  const [fullName, setFullName] = React.useState(profile?.full_name ?? "");
  const [headline, setHeadline] = React.useState(profile?.headline ?? "");
  const [avatar, setAvatar] = React.useState(profile?.avatar_url ?? "");
  const [location, setLocation] = React.useState(profile?.location ?? "");
  const [gear, setGear] = React.useState<GearRow[]>(() =>
    (profile?.gear ?? []).map((g) => ({
      key: nextKey(),
      label: g.label,
      items: (g.items ?? []).join("\n"),
    }))
  );

  const socials = profile?.social_links ?? {};

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <FormError>{state.error}</FormError>

        <FormSection title="Identity" description="The name and line that open the about section.">
          <Field label="Full name" htmlFor="full_name">
            <Input
              id="full_name"
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Roger Raker"
              required
            />
            <FieldError>{errors.full_name}</FieldError>
          </Field>
          <Field label="Headline" htmlFor="headline" hint="One line under the name">
            <Input
              id="headline"
              name="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Filmmaker and vlogger, short films since 2010"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location" htmlFor="location">
              <Input
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Quezon City, Philippines"
              />
            </Field>
            <Field label="Email" htmlFor="email" hint="Public contact address">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={profile?.email ?? ""}
                placeholder="hello@rogerraker.com"
              />
            </Field>
          </div>
          <Field label="Avatar URL" htmlFor="avatar_url">
            <Input
              id="avatar_url"
              name="avatar_url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://…/photo.jpg"
            />
          </Field>
        </FormSection>

        <FormSection title="Words" description="The bio and the philosophy paragraph on the about page.">
          <Field label="Bio" htmlFor="bio">
            <Textarea id="bio" name="bio" rows={6} defaultValue={profile?.bio ?? ""} />
          </Field>
          <Field label="Philosophy" htmlFor="philosophy">
            <Textarea
              id="philosophy"
              name="philosophy"
              rows={5}
              defaultValue={profile?.philosophy ?? ""}
              placeholder="How you work, in your own words."
            />
          </Field>
        </FormSection>

        <FormSection title="Socials" description="Leave a field blank to hide that link.">
          <div className="grid gap-5 sm:grid-cols-2">
            {SOCIALS.map((s) => (
              <Field key={s.name} label={s.label} htmlFor={s.name}>
                <Input
                  id={s.name}
                  name={s.name}
                  defaultValue={socials[s.key] ?? ""}
                  placeholder={s.placeholder}
                />
              </Field>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Gear"
          description="Grouped kit list. One group per kind of gear: camera, edit, sound, light."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGear((rows) => [...rows, { key: nextKey(), label: "", items: "" }])}
            >
              <Plus size={14} strokeWidth={1.5} />
              Add group
            </Button>
          }
        >
          {gear.length ? (
            <ul className="space-y-3">
              {gear.map((row, i) => (
                <li key={row.key} className="rounded-[2px] border border-stroke bg-[#0b0c10] p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input
                        name="gear_label"
                        value={row.label}
                        aria-label={`Gear group ${i + 1} label`}
                        placeholder="Camera"
                        onChange={(e) =>
                          setGear((rows) =>
                            rows.map((r, idx) => (idx === i ? { ...r, label: e.target.value } : r))
                          )
                        }
                      />
                      <Textarea
                        name="gear_items"
                        value={row.items}
                        rows={4}
                        aria-label={`Gear group ${i + 1} items`}
                        placeholder={"Sony A7 III\nSony ZV-1\niPhone for b-roll"}
                        onChange={(e) =>
                          setGear((rows) =>
                            rows.map((r, idx) => (idx === i ? { ...r, items: e.target.value } : r))
                          )
                        }
                      />
                      <p className="text-[11px] text-faint">One item per line.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGear((rows) => rows.filter((_, idx) => idx !== i))}
                      aria-label={`Remove gear group ${i + 1}`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-[#7f2a2a] hover:text-[#ff8a8a]"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-faint">
              No gear groups yet. Add one and the about page starts listing kit.
            </p>
          )}
        </FormSection>

        <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-3 border-t border-stroke bg-void/90 py-4 backdrop-blur-md">
          <div className="min-w-0 flex-1 text-[13px]">
            {state.message ? (
              <span className="inline-flex items-center gap-1.5 text-cyan">
                <Check size={14} strokeWidth={1.5} />
                {state.message}
              </span>
            ) : (
              <span className="text-faint">Shown on the about section of the public site.</span>
            )}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>

      <aside className="min-w-0">
        <div className="xl:sticky xl:top-[7.5rem]">
          <p className="label mb-2">Preview</p>
          <div className="panel rounded-[2px] p-5">
            <div className="grid h-24 w-24 place-items-center overflow-hidden border border-stroke bg-panel-2">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              ) : (
                <UserRound size={22} strokeWidth={1.5} className="text-faint" />
              )}
            </div>
            <h3 className="display-tight mt-4 text-[18px] text-ink">
              {fullName || "Name goes here"}
            </h3>
            {headline ? <p className="mt-1 text-[13px] text-muted">{headline}</p> : null}
            {location ? <p className="mt-1 text-[12px] text-faint">{location}</p> : null}
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-faint">
            The avatar is loaded straight from the URL, so paste one that is publicly reachable.
          </p>
        </div>
      </aside>
    </form>
  );
}
