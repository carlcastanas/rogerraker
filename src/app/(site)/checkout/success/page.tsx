import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleCheck, Download, SearchX } from "lucide-react";
import { getOrderByReference } from "@/lib/queries";
import { ButtonLink, buttonStyles } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your download is ready.",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params.ref;
  const reference = typeof raw === "string" ? raw.trim() : "";
  const order = reference ? await getOrderByReference(reference) : null;

  if (!order) {
    return (
      <div className="shell pt-24 pb-20 md:pt-28 md:pb-28">
        <div className="panel mx-auto max-w-[620px] rounded-[2px] px-6 py-12 text-center md:px-10">
          <SearchX size={20} strokeWidth={1.5} aria-hidden className="mx-auto text-faint" />
          <h1 className="display mt-5 text-[clamp(1.5rem,2.8vw,2.25rem)] text-ink">
            I can&apos;t find that order.
          </h1>
          <p className="mx-auto mt-4 max-w-[50ch] text-[15px] leading-[1.75] text-ink/75">
            {reference
              ? `Nothing on file matches ${reference}. The link in your receipt email should still work. If it doesn't, reply to that email and I'll look it up.`
              : "This page needs an order reference and the link you used doesn't have one. The link in your receipt email does."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/store" variant="primary" size="md">
              Back to the toolkit
            </ButtonLink>
            <ButtonLink href="/work" variant="outline" size="md">
              Watch the films
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const rows = [
    { term: "Reference", detail: order.reference ?? "—" },
    { term: "Placed", detail: formatDate(order.created_at) },
    { term: "Receipt sent to", detail: order.customer_email },
    { term: "Paid", detail: formatPrice(Number(order.amount)) },
  ];

  return (
    <div className="shell pt-24 pb-20 md:pt-28 md:pb-28">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-center gap-2.5">
          <CircleCheck size={18} strokeWidth={1.5} aria-hidden className="text-cyan" />
          <p className="label text-cyan">Order confirmed</p>
        </div>
        <h1 className="display mt-3 text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink">
          {order.customer_name ? `Salamat, ${order.customer_name}.` : "Salamat."} Your download is
          ready.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.75] text-ink/75 md:text-base">
          Download it below. A copy of this receipt is on the way to {order.customer_email}, and
          the link keeps working so there&apos;s no rush.
        </p>

        <div className="panel mt-8 rounded-[2px] md:mt-10">
          <div className="flex flex-col gap-4 border-b border-stroke px-5 py-5 sm:flex-row sm:items-center">
            {order.product_cover ? (
              <div className="relative aspect-video w-full shrink-0 overflow-hidden border border-stroke sm:w-32">
                <Image
                  src={order.product_cover}
                  alt={`Cover for ${order.product_title ?? "your pack"}`}
                  fill
                  sizes="(min-width: 640px) 128px, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <h2 className="display-tight text-[16px] text-ink">
                {order.product_title ?? "Your purchase"}
              </h2>
              {order.product_slug ? (
                <Link
                  href={`/store/${order.product_slug}`}
                  className="mt-1.5 inline-block text-[13px] text-muted transition-colors hover:text-cyan"
                >
                  See the pack page
                </Link>
              ) : null}
            </div>
            {order.download_token ? (
              <a
                href={`/api/download/${order.download_token}`}
                className={buttonStyles({ variant: "primary", size: "lg" })}
              >
                <Download size={16} strokeWidth={1.5} aria-hidden />
                Download
              </a>
            ) : null}
          </div>

          <dl className="grid grid-cols-1 gap-px bg-stroke sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.term} className="bg-panel px-5 py-4">
                <dt className="label">{row.term}</dt>
                <dd className="tnum mt-1.5 text-sm break-all text-ink">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-faint">
          Demo checkout. Nothing was charged.
        </p>

        <div className="mt-10 border-t border-stroke pt-8">
          <ButtonLink href="/store" variant="outline" size="md">
            See the rest of the toolkit
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
