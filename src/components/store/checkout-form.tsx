"use client";

import * as React from "react";
import { useActionState } from "react";
import { CreditCard, Lock, Smartphone, TriangleAlert } from "lucide-react";
import { placeOrderAction } from "@/lib/actions/orders";
import { idleState } from "@/lib/actions/shared";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

/** What people here actually pay with. GCash is the default for a reason. */
const METHODS = [
  { value: "gcash", label: "GCash", detail: "Pay from your wallet", icon: Smartphone },
  { value: "card", label: "Card", detail: "Visa, Mastercard, JCB", icon: CreditCard },
] as const;

export function CheckoutForm({ product }: { product: Product }) {
  const [state, formAction, pending] = useActionState(placeOrderAction, idleState);
  const [method, setMethod] = React.useState<string>("gcash");
  const price = Number(product.price);

  return (
    <form action={formAction} className="space-y-6 md:space-y-8">
      <input type="hidden" name="slug" value={product.slug} />

      <section className="panel rounded-[2px]">
        <div className="border-b border-stroke px-5 py-4">
          <h2 className="display-tight text-[15px] text-ink">Where the download goes</h2>
        </div>
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="customer_name">
            <Input
              id="customer_name"
              name="customer_name"
              autoComplete="name"
              required
              placeholder="Juan dela Cruz"
            />
          </Field>
          <Field label="Email" htmlFor="customer_email" hint="Receipt and link">
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              autoComplete="email"
              required
              placeholder="juan@gmail.com"
              aria-describedby={state.error ? "checkout-error" : undefined}
            />
          </Field>
        </div>
      </section>

      <section className="panel rounded-[2px]">
        <div className="border-b border-stroke px-5 py-4">
          <h2 className="display-tight text-[15px] text-ink">How you are paying</h2>
        </div>

        <div className="grid gap-3 px-5 py-5 sm:grid-cols-2">
          {METHODS.map((option) => {
            const Icon = option.icon;
            const isActive = method === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[2px] border px-4 py-3.5 transition-colors",
                  isActive
                    ? "border-cyan/50 bg-cyan/[0.06]"
                    : "border-stroke hover:border-stroke-strong"
                )}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={option.value}
                  checked={isActive}
                  onChange={() => setMethod(option.value)}
                  className="sr-only"
                />
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden
                  className={cn("mt-0.5", isActive ? "text-cyan" : "text-faint")}
                />
                <span>
                  <span
                    className={cn(
                      "display-tight block text-[14px]",
                      isActive ? "text-cyan" : "text-ink"
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-faint">{option.detail}</span>
                </span>
              </label>
            );
          })}
        </div>

        {method === "card" ? (
          <fieldset disabled className="grid gap-5 border-t border-stroke px-5 py-5 sm:grid-cols-4">
            <legend className="sr-only">Card details</legend>
            <Field label="Card number" htmlFor="demo_card_number" className="sm:col-span-2">
              <Input id="demo_card_number" value="4242 4242 4242 4242" readOnly tabIndex={-1} />
            </Field>
            <Field label="Expiry" htmlFor="demo_card_expiry">
              <Input id="demo_card_expiry" value="12 / 28" readOnly tabIndex={-1} />
            </Field>
            <Field label="CVC" htmlFor="demo_card_cvc">
              <Input id="demo_card_cvc" value="123" readOnly tabIndex={-1} />
            </Field>
          </fieldset>
        ) : (
          <fieldset disabled className="grid gap-5 border-t border-stroke px-5 py-5 sm:grid-cols-2">
            <legend className="sr-only">GCash details</legend>
            <Field label="GCash number" htmlFor="demo_gcash_number">
              <Input id="demo_gcash_number" value="0917 123 4567" readOnly tabIndex={-1} />
            </Field>
            <Field label="Registered name" htmlFor="demo_gcash_name">
              <Input id="demo_gcash_name" value="Juan dela Cruz" readOnly tabIndex={-1} />
            </Field>
          </fieldset>
        )}
      </section>

      {state.error ? (
        <p
          id="checkout-error"
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-[#4a1d1d] bg-[#1a0c0c] px-4 py-3 text-[13px] text-[#ffb4b4]"
        >
          <TriangleAlert size={15} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-[12px] text-faint">
          <Lock size={13} strokeWidth={1.5} aria-hidden />
          Demo checkout. Nothing is charged.
        </p>
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Placing your order" : `Place order, ${formatPrice(price)}`}
        </Button>
      </div>
    </form>
  );
}
