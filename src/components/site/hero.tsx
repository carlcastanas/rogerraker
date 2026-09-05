import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { GradeSlider } from "@/components/site/grade-slider";
import type { Profile, SiteContent } from "@/lib/types";

/**
 * Name, headline, two ways in, and the numbers that are actually true about the
 * channel. The comparison frame sits beside the copy so it is on screen the
 * moment the page loads — it is the demo for the LUT packs, not decoration.
 */
export function Hero({
  content,
  profile,
}: {
  content: SiteContent;
  profile: Profile | null;
}) {
  const { hero } = content;
  const stats = content.about.metrics.slice(0, 3);
  const name = profile?.full_name ?? "Roger Raker";

  return (
    <section className="grain relative overflow-hidden border-b border-stroke">
      {/* One restrained pool of light behind the frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-30rem] h-[52rem] w-[120vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(45% 45% at 50% 50%, rgba(34,211,238,.16), rgba(34,211,238,0) 72%)",
        }}
      />

      <div className="shell relative z-[2] pb-16 pt-24 md:pb-20 md:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full border border-stroke-strong">
                  <Image
                    src={profile.avatar_url}
                    alt={`Photo of ${name}`}
                    fill
                    priority
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="display-tight text-[14px] leading-5 text-ink">{name}</p>
                <p className="text-[13px] leading-5 text-muted">
                  {profile?.headline ?? hero.eyebrow}
                </p>
              </div>
            </div>

            <h1 className="display mt-7 text-[clamp(2.5rem,6.4vw,5rem)] text-ink">
              {hero.headline}
            </h1>

            <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.75] text-ink/80">
              {hero.subhead}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/store" variant="primary" size="lg" className="display-tight">
                {hero.primary_cta}
              </ButtonLink>
              <ButtonLink href="/work" variant="glass" size="lg" className="display-tight">
                {hero.secondary_cta}
              </ButtonLink>
            </div>

            {stats.length ? (
              <ul className="mt-10 grid grid-cols-3 gap-px border border-stroke bg-stroke">
                {stats.map((stat) => (
                  <li key={stat.label} className="bg-void px-3 py-4 sm:px-4 sm:py-5">
                    <p className="display tnum text-[clamp(1.25rem,2.4vw,1.75rem)] text-ink">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-snug text-muted">{stat.label}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="lg:col-span-6">
            <GradeSlider
              beforeImage={hero.before_image}
              afterImage={hero.after_image}
              frameNote={hero.frame_note}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
