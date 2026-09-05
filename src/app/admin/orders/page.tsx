import { AdminShell } from "@/components/admin/shell";
import { OrderTable } from "@/components/admin/order-table";
import { getOrders } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrders(200);

  const gross = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.amount), 0);
  const completed = orders.filter((o) => o.status === "completed").length;
  const refunded = orders
    .filter((o) => o.status === "refunded")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <AdminShell
      title="Orders"
      description="Every purchase from the storefront, newest first. Change a status or remove a test record."
    >
      <section
        aria-label="Order totals"
        className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-stroke bg-stroke sm:grid-cols-3"
      >
        <div className="bg-panel px-4 py-4">
          <p className="label">Gross revenue</p>
          <p className="display-tight tnum mt-2 text-[24px] leading-none text-ink">
            {formatPrice(gross)}
          </p>
          <p className="mt-1.5 text-[11px] text-faint">Completed orders only</p>
        </div>
        <div className="bg-panel px-4 py-4">
          <p className="label">Completed</p>
          <p className="display-tight tnum mt-2 text-[24px] leading-none text-ink">{completed}</p>
          <p className="tnum mt-1.5 text-[11px] text-faint">of {orders.length} orders</p>
        </div>
        <div className="bg-panel px-4 py-4">
          <p className="label">Refunded</p>
          <p className="display-tight tnum mt-2 text-[24px] leading-none text-ink">
            {formatPrice(refunded)}
          </p>
          <p className="mt-1.5 text-[11px] text-faint">Money returned</p>
        </div>
      </section>

      <p className="mb-4 text-[12px] leading-relaxed text-faint">
        Checkout is a demo. No payment processor is called, and orders go straight into the
        database as completed. The statuses here are only for testing the workflow.
      </p>

      <OrderTable orders={orders} />
    </AdminShell>
  );
}
