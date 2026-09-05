import * as React from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { SectionHead } from "@/components/site/section-head";
import type { Profile, SiteContent } from "@/lib/types";

function paragraphs(text: string | null | undefined) {
  if (!text) return [];
  return text
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function Block({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="display-tight text-[19px] leading-snug text-ink md:text-[21px]">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

/**
 * Short titled blocks, one idea each, in Roger's own words. The numbers live in
 * the hero; what is left here is the story and the sequence behind it.
 */
export function AboutSection({
  content,
  profile,
}: {
  content: SiteContent["about"];
  profile: Profile | null;
}) {
  const bio = paragraphs(profile?.bio);
  const philosophy = paragraphs(profile?.philosophy);
  const gear = profile?.gear ?? [];
  /* The hero already carries the first three metrics — show whatever is left. */
  const spare = content.metrics.slice(3);

  return (
    <section id="about" className="shell scroll-mt-24 py-20 md:py-28">
      <SectionHead index="" title={content.title} intro={content.intro} />

      <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-12 lg:gap-14">
        {profile?.avatar_url ? (
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-stroke bg-panel-2">
              <Image
                src={profile.avatar_url}
                alt={`Portrait of ${profile.full_name}`}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(8,8,10,0) 62%, rgba(8,8,10,.7) 100%)",
                }}
              />
            </div>

            <div className="grid gap-px border border-t-0 border-stroke bg-stroke sm:grid-cols-2">
              {profile.location ? (
                <div className="bg-void px-4 py-3.5">
                  <p className="flex items-center gap-2 text-[14px] leading-5 text-ink">
                    <MapPin size={15} strokeWidth={1.5} className="shrink-0 text-cyan" />
                    {profile.location}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-muted">Where I&apos;m based</p>
                </div>
              ) : null}
              {spare.map((metric) => (
                <div key={metric.label} className="bg-void px-4 py-3.5">
                  <p className="display-tight tnum text-[14px] leading-5 text-ink">{metric.value}</p>
                  <p className="mt-1 text-[12px] leading-snug text-muted">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className={profile?.avatar_url ? "lg:col-span-7" : "lg:col-span-8"}>
          <div className="space-y-8">
            {bio.length ? (
              <Block title="Who I am">
                {bio.map((para, i) => (
                  <p key={i} className="max-w-[62ch] text-[15px] leading-[1.75] text-ink/80">
                    {para}
                  </p>
                ))}
              </Block>
            ) : null}

            {philosophy.length ? (
              <Block title={content.philosophy_title} className="border-l-2 border-cyan/70 pl-5">
                {philosophy.map((para, i) => (
                  <p key={i} className="max-w-[62ch] text-[15px] leading-[1.75] text-ink/80">
                    {para}
                  </p>
                ))}
              </Block>
            ) : null}

            {gear.length ? (
              <Block title="What I use">
                <div className="grid gap-px border border-stroke bg-stroke sm:grid-cols-2">
                  {gear.map((group) => (
                    <div key={group.label} className="bg-void p-4">
                      <h4 className="display-tight text-[13px] text-cyan">{group.label}</h4>
                      <ul className="mt-2.5 space-y-1.5">
                        {group.items.map((item) => (
                          <li key={item} className="text-[14px] leading-6 text-muted">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Block>
            ) : null}
          </div>
        </div>
      </div>

      {content.process.length ? (
        <div className="mt-14 md:mt-16">
          <h3 className="display-tight text-[19px] leading-snug text-ink md:text-[21px]">
            How I make a film
          </h3>
          {/* A real sequence — the only place on the site where numbers lead. */}
          <ol className="mt-6 border-t border-stroke">
            {content.process.map((step, i) => (
              <li
                key={step.title}
                className="grid gap-3 border-b border-stroke py-6 md:grid-cols-12 md:gap-8"
              >
                <div className="flex items-baseline gap-3 md:col-span-5">
                  <span className="display tnum text-[13px] leading-6 text-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="display-tight text-[17px] leading-snug text-ink md:text-[18px]">
                    {step.title}
                  </h4>
                </div>
                <p className="max-w-[62ch] text-[15px] leading-[1.75] text-ink/80 md:col-span-7">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
