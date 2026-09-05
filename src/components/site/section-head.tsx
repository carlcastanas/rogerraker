import * as React from "react";

/**
 * One heading rhythm for every section: a quiet label, the title at the
 * section scale (never the hero scale), and an optional intro.
 *
 * `index` is rendered only when it says something. Older pages pass "01" / "02";
 * bare numbers are dropped rather than printed, because numbered markers belong
 * to the About process list and nowhere else.
 */
export function SectionHead({
  index,
  title,
  intro,
  action,
}: {
  index: string;
  title: string;
  intro?: string;
  action?: React.ReactNode;
}) {
  const showIndex =
    Boolean(index) &&
    !/^\d+$/.test(index.trim()) &&
    index.trim().toLowerCase() !== title.trim().toLowerCase();

  return (
    <div className="hairline pt-6 md:pt-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-[58ch]">
          {showIndex ? <span className="label">{index}</span> : null}
          <h2
            className={`display text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink ${
              showIndex ? "mt-2.5" : ""
            }`}
          >
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.75] text-ink/80">{intro}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
