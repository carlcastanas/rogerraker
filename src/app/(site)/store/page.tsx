import type { Metadata } from "next";
import { Download, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import { getProducts, getSiteContent } from "@/lib/queries";
import { ButtonLink } from "@/components/ui/button";
import { StoreIndex } from "@/components/store/store-index";

export const metadata: Metadata = {
  title: "The toolkit",
  description:
    "LUTs, project files, editing templates, sound, and guides from fifteen years of short films and vlogs. Prices are in pesos and you download right after checkout.",
};

const INCLUDED = [
  {
    icon: Download,
    title: "Download right after checkout",
    detail: "The link works as soon as your order goes through.",
  },
  {
    icon: RefreshCw,
    title: "You can download it again",
    detail: "Grab it as many times as you need. Updates to that pack are free.",
  },
  {
    icon: ShieldCheck,
    title: "Cleared for monetised uploads",
    detail: "Use them on your own channel and on paid work. No claims, no extra fee.",
  },
  {
    icon: FileText,
    title: "Install guide in Tagalog and English",
    detail: "Step by step, with screenshots for every app the pack works in.",
  },
];

export default async function StorePage() {
  const [products, content] = await Promise.all([
    getProducts({ publishedOnly: true }),
    getSiteContent(),
  ]);

  return (
    <div className="shell pt-24 pb-20 md:pt-28 md:pb-28">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[54ch]">
          <h1 className="display text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink">
            {content.store.title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.75] text-ink/75 md:text-base">
            {content.store.intro}
          </p>
        </div>
        <ButtonLink href="/work" variant="outline" size="md" className="self-start md:self-auto">
          See the films they came from
        </ButtonLink>
      </header>

      <section
        aria-label="What every pack includes"
        className="mt-8 border border-stroke md:mt-10"
      >
        <p className="border-b border-stroke px-5 py-3.5 text-[14px] leading-relaxed text-ink/70">
          {content.store.note}
        </p>
        <div className="grid grid-cols-1 gap-px bg-stroke sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-panel px-5 py-5">
                <Icon size={16} strokeWidth={1.5} aria-hidden className="text-cyan" />
                <h2 className="display-tight mt-3 text-[14px] text-ink">{item.title}</h2>
                <p className="mt-1.5 text-[13px] leading-[1.65] text-muted">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-12 md:mt-16">
        {products.length === 0 ? (
          <div className="panel px-6 py-16 text-center">
            <p className="display-tight text-lg text-ink">Nothing is up yet.</p>
            <p className="mx-auto mt-2.5 max-w-[52ch] text-[15px] leading-relaxed text-ink/70">
              I only put a pack up after I&apos;ve used it on something you can watch, so it takes
              a while. The films are up already.
            </p>
            <ButtonLink href="/work" variant="glass" size="md" className="mt-7">
              Watch the films
            </ButtonLink>
          </div>
        ) : (
          <StoreIndex products={products} categories={content.store_categories} />
        )}
      </div>
    </div>
  );
}
