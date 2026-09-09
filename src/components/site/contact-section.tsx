"use client";

import { useActionState } from "react";
import { Check, Clock, Loader2, Mail, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { SectionHead } from "@/components/site/section-head";
import { sendMessageAction } from "@/lib/actions/messages";
import { idleState } from "@/lib/actions/shared";
import type { SiteContent } from "@/lib/types";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-[12px] leading-5 text-ember">
      {message}
    </p>
  );
}

export function ContactSection({ content }: { content: SiteContent["contact"] }) {
  const [state, formAction, pending] = useActionState(sendMessageAction, idleState);
  const errors = state.fieldErrors ?? {};

  return (
    <section id="contact" className="scroll-mt-24 border-t border-stroke bg-panel/40 py-20 md:py-28">
      <div className="shell">
        <SectionHead index="" title={content.title} intro={content.intro} />

        <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <dl className="space-y-6">
              <div>
                <dt className="label">Email</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${content.email}`}
                    className="inline-flex items-center gap-2 text-[15px] leading-6 text-ink transition-colors hover:text-cyan"
                  >
                    <Mail size={15} strokeWidth={1.5} className="text-cyan" />
                    {content.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label">Reply time</dt>
                <dd className="mt-1.5 flex max-w-[40ch] items-start gap-2 text-[14px] leading-[1.7] text-ink/75">
                  <Clock size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-faint" />
                  {content.response_time}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-8">
            {state.ok && state.message ? (
              <p
                role="status"
                className="mb-5 flex items-start gap-2.5 border border-cyan/40 bg-cyan/10 p-3.5 text-[14px] leading-[1.7] text-cyan"
              >
                <Check size={15} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                {state.message}
              </p>
            ) : null}

            {!state.ok && state.error ? (
              <p
                role="alert"
                className="mb-5 flex items-start gap-2.5 border border-[#ff6a3d]/40 bg-[#ff6a3d]/10 p-3.5 text-[14px] leading-[1.7] text-ember"
              >
                <TriangleAlert size={15} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                {state.error}
              </p>
            ) : null}

            <form key={state.ok ? "sent" : "draft"} action={formAction} className="space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" htmlFor="contact-name">
                  <Input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Juan dela Cruz"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                  />
                  <FieldError id="contact-name-error" message={errors.name} />
                </Field>

                <Field label="Email" htmlFor="contact-email">
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                  />
                  <FieldError id="contact-email-error" message={errors.email} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Project type" htmlFor="contact-project-type">
                  <Select id="contact-project-type" name="project_type" defaultValue="">
                    <option value="">Pick the closest one</option>
                    {[...new Set(content.project_types.filter(Boolean))].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Budget" htmlFor="contact-budget">
                  <Select id="contact-budget" name="budget" defaultValue="">
                    <option value="">Rough range is fine</option>
                    {[...new Set(content.budgets.filter(Boolean))].map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="What you're making" htmlFor="contact-message" hint="And when you need it">
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="A one-minute launch film for a coffee brand, shooting in March."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
                <FieldError id="contact-message-error" message={errors.message} />
              </Field>

              <Button type="submit" variant="primary" size="lg" disabled={pending} className="display-tight">
                {pending ? (
                  <>
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                    Sending
                  </>
                ) : (
                  "Send it"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
