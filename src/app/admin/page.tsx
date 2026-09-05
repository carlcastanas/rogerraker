import Link from "next/link";
import { ArrowUpRight, Mail, Package, Plus, Receipt } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { EmptyState, OrderStatusBadge } from "@/components/admin/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  getDailyRevenue,
  getDashboardStats,
  getMessages,
  getOrders,
  getRevenueByProduct,
} from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatCell({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="bg-panel px-4 py-4">
      <p className="label">{label}</p>
      <p className="display-tight tnum mt-2 text-[24px] leading-none text-ink">{value}</p>
      {note ? <p className="mt-1.5 text-[11px] text-faint">{note}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, byProduct, daily, orders, messages] = await Promise.all([
    getDashboardStats(),
    getRevenueByProduct(6),
    getDailyRevenue(14),
    getOrders(8),
    getMessages(5),
  ]);

  const topRevenue = byProduct.reduce((hi, r) => Math.max(hi, Number(r.total) || 0), 0);

  return (
    <AdminShell
      title="Dashboard"
      description="Sales, orders, and anything waiting on a reply."
      action={
        <ButtonLink href="/admin/products/new" size="md">
          <Plus size={15} strokeWidth={1.5} />
          New product
        </ButtonLink>
      }
    >
      {/* Instrument panel */}
      <section
        aria-label="Store at a glance"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-stroke bg-stroke md:grid-cols-3 xl:grid-cols-6"
      >
        <StatCell label="Total revenue" value={formatPrice(stats.revenue)} note="Completed orders" />
        <StatCell
          label="Last 30 days"
          value={formatPrice(stats.revenue_30d)}
          note={`${stats.orders_30d} order${stats.orders_30d === 1 ? "" : "s"}`}
        />
        <StatCell label="Orders" value={String(stats.orders)} note="All time" />
        <StatCell
          label="Published products"
          value={String(stats.published_products)}
          note={`${stats.products} in the catalogue`}
        />
        <StatCell label="Films" value={String(stats.projects)} note="On the films page" />
        <StatCell
          label="Unread messages"
          value={String(stats.unread_messages)}
          note={stats.unread_messages ? "Waiting on a reply" : "Inbox is clear"}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Panel className="overflow-hidden">
          <RevenueChart data={daily} days={14} />
        </Panel>

        <Panel>
          <PanelHeader title="Revenue by product" description="Completed orders, all time." />
          {byProduct.length ? (
            <ul className="divide-y divide-stroke">
              {byProduct.map((row) => {
                const total = Number(row.total) || 0;
                const pct = topRevenue > 0 ? Math.max(2, (total / topRevenue) * 100) : 0;
                return (
                  <li key={row.title} className="px-5 py-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] text-ink">{row.title}</span>
                      <span className="tnum shrink-0 text-[13px] text-muted">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-[#0b0c10]">
                      <div
                        className="h-full bg-cyan/70"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                    </div>
                    <p className="tnum mt-1.5 text-[11px] text-faint">
                      {row.count} order{row.count === 1 ? "" : "s"}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              body="Add a product and revenue will start reporting here."
            />
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Recent orders"
            description="From the demo checkout."
            action={
              <Link
                href="/admin/orders"
                className="display-tight inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-cyan"
              >
                All orders
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </Link>
            }
          />
          {orders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-stroke">
                    <th className="label px-5 py-2.5 font-normal">Reference</th>
                    <th className="label px-5 py-2.5 font-normal">Customer</th>
                    <th className="label px-5 py-2.5 font-normal">Product</th>
                    <th className="label px-5 py-2.5 text-right font-normal">Amount</th>
                    <th className="label px-5 py-2.5 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-[rgba(245,245,247,.02)]">
                      <td className="px-5 py-3">
                        <span className="tnum block text-[13px] text-ink">
                          {order.reference ?? "—"}
                        </span>
                        <span className="tnum block text-[11px] text-faint">
                          {formatDate(order.created_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="block max-w-[18ch] truncate text-[13px] text-ink">
                          {order.customer_name ?? "—"}
                        </span>
                        <span className="block max-w-[22ch] truncate text-[11px] text-faint">
                          {order.customer_email}
                        </span>
                      </td>
                      <td className="max-w-[22ch] truncate px-5 py-3 text-[13px] text-muted">
                        {order.product_title ?? "Deleted product"}
                      </td>
                      <td className="tnum px-5 py-3 text-right text-[13px] text-ink">
                        {formatPrice(order.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No orders yet"
              body="Orders placed through the demo checkout land here the moment they clear."
            />
          )}
        </Panel>

        <Panel>
          <PanelHeader
            title="Recent messages"
            description="From the contact form."
            action={
              <Link
                href="/admin/messages"
                className="display-tight inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-cyan"
              >
                Inbox
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </Link>
            }
          />
          {messages.length ? (
            <ul className="divide-y divide-stroke">
              {messages.map((message) => (
                <li key={message.id}>
                  <Link
                    href="/admin/messages"
                    className="block px-5 py-3.5 transition-colors hover:bg-[rgba(245,245,247,.02)]"
                  >
                    <div className="flex items-center gap-2">
                      {!message.is_read ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
                      ) : null}
                      <span className="flex-1 truncate text-[13px] text-ink">{message.name}</span>
                      <span className="tnum shrink-0 text-[11px] text-faint">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                      {message.message}
                    </p>
                    {message.project_type ? (
                      <p className="mt-1.5 text-[11px] text-faint">{message.project_type}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Mail}
              title="Inbox is empty"
              body="Enquiries sent from the contact page show up here."
            />
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
