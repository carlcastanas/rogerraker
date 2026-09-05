"use client";

import * as React from "react";
import { Receipt, Search } from "lucide-react";
import { Select, Input } from "@/components/ui/field";
import { deleteOrderAction, updateOrderStatusAction } from "@/lib/actions/orders";
import type { OrderWithProduct } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { ConfirmAction } from "./confirm-action";
import { EmptyState } from "./primitives";

const STATUSES = ["completed", "pending", "refunded", "failed"] as const;

function StatusControl({ order }: { order: OrderWithProduct }) {
  const [pending, startTransition] = React.useTransition();
  const [value, setValue] = React.useOptimistic<string>(order.status);

  return (
    <Select
      value={value}
      disabled={pending}
      aria-label={`Status for order ${order.reference ?? order.id}`}
      className="h-8 w-auto min-w-[124px] text-[12px]"
      onChange={(e) => {
        const next = e.target.value;
        const fd = new FormData();
        fd.set("id", order.id);
        fd.set("status", next);
        startTransition(async () => {
          setValue(next);
          await updateOrderStatusAction(fd);
        });
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </Select>
  );
}

export function OrderTable({ orders }: { orders: OrderWithProduct[] }) {
  const [term, setTerm] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = term.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return (
        (o.reference ?? "").toLowerCase().includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        (o.product_title ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, term, status]);

  if (!orders.length) {
    return (
      <div className="panel rounded-[2px]">
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          body="Anything bought through the demo checkout appears here the moment it clears, with a reference you can search."
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
            placeholder="Search reference, customer, or product"
            aria-label="Search orders"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="w-auto min-w-[150px]"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <p className="tnum ml-auto text-[12px] text-faint">
          {filtered.length} of {orders.length}
        </p>
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={Search}
          title="Nothing matches"
          body="No order matches that search and filter. Clear one of them to see the rest."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="label px-4 py-2.5 font-normal">Reference</th>
                  <th className="label px-4 py-2.5 font-normal">Customer</th>
                  <th className="label px-4 py-2.5 font-normal">Product</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Amount</th>
                  <th className="label px-4 py-2.5 font-normal">Method</th>
                  <th className="label px-4 py-2.5 font-normal">Status</th>
                  <th className="label px-4 py-2.5 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {filtered.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-[rgba(245,245,247,.02)]">
                    <td className="px-4 py-3">
                      <span className="tnum block text-[13px] text-ink">{o.reference ?? "—"}</span>
                      <span className="tnum block text-[11px] text-faint">
                        {formatDate(o.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-[20ch] truncate text-[13px] text-ink">
                        {o.customer_name ?? "—"}
                      </span>
                      <a
                        href={`mailto:${o.customer_email}`}
                        className="block max-w-[24ch] truncate text-[11px] text-faint transition-colors hover:text-cyan"
                      >
                        {o.customer_email}
                      </a>
                    </td>
                    <td className="max-w-[24ch] truncate px-4 py-3 text-[13px] text-muted">
                      {o.product_title ?? "Deleted product"}
                    </td>
                    <td className="tnum px-4 py-3 text-right text-[13px] text-ink">
                      {formatPrice(o.amount)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted">{o.payment_method ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusControl order={o} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <ConfirmAction
                          action={deleteOrderAction}
                          id={o.id}
                          triggerLabel={`Delete order ${o.reference ?? ""}`}
                          body={`Delete order ${o.reference ?? "record"}? The revenue disappears from the dashboard with it.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-stroke md:hidden">
            {filtered.map((o) => (
              <li key={o.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="tnum text-[13px] text-ink">{o.reference ?? "—"}</p>
                    <p className="tnum text-[11px] text-faint">{formatDate(o.created_at)}</p>
                  </div>
                  <p className="tnum display-tight text-[15px] text-ink">{formatPrice(o.amount)}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-muted">{o.customer_name ?? "—"}</p>
                  <p className="truncate text-[11px] text-faint">{o.customer_email}</p>
                  <p className="mt-1 truncate text-[12px] text-muted">
                    {o.product_title ?? "Deleted product"} · {o.payment_method ?? "—"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <StatusControl order={o} />
                  <ConfirmAction
                    action={deleteOrderAction}
                    id={o.id}
                    triggerLabel={`Delete order ${o.reference ?? ""}`}
                    body={`Delete order ${o.reference ?? "record"}? The revenue disappears from the dashboard with it.`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
