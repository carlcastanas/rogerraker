"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Lightbox } from "@/components/work/lightbox";

/**
 * Cover plus the reference frames the pack was built against. Everything here
 * is 16:9 because every source is a frame from the channel — cropping it to
 * anything else would re-frame Roger's own shot.
 */
export function ProductGallery({
  images,
  ramp,
  title,
}: {
  images: string[];
  ramp: string[];
  title: string;
}) {
  const [selected, setSelected] = React.useState(0);
  const [open, setOpen] = React.useState<number | null>(null);
  const captionFor = React.useCallback(
    (i: number) => `${title}, reference frame ${i + 1} of ${images.length}`,
    [title, images.length]
  );

  const current = images[selected] ?? images[0];

  return (
    <div>
      {current ? (
        <button
          type="button"
          onClick={() => setOpen(selected)}
          aria-label={`Open ${captionFor(selected)}`}
          className="group relative block aspect-video w-full overflow-hidden border border-stroke transition-colors hover:border-stroke-strong"
        >
          <Image
            src={current}
            alt={`${title}, reference frame`}
            fill
            priority
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-cover"
          />
        </button>
      ) : null}

      {images.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {images.map((src, i) => (
            <li key={src} className="w-[calc(25%_-_0.5625rem)] max-w-[180px]">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Show reference frame ${i + 1}`}
                aria-current={i === selected}
                className={cn(
                  "relative block aspect-video w-full overflow-hidden border transition-colors",
                  i === selected
                    ? "border-cyan/60"
                    : "border-stroke opacity-65 hover:border-stroke-strong hover:opacity-100"
                )}
              >
                <Image
                  src={src}
                  alt={`${title}, frame ${i + 1}`}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-[12px] leading-relaxed text-faint">
        Reference frames from the channel. This is the footage I built and tested the pack on.
      </p>

      {ramp.length > 0 ? (
        <figure className="mt-7 border border-stroke">
          <figcaption className="flex items-center justify-between gap-4 border-b border-stroke px-4 py-2.5">
            <span className="label">The look, shadows to highlights</span>
            <span className="tnum text-[11px] text-faint">{ramp.length} stops</span>
          </figcaption>
          <div className="flex h-12 sm:h-14">
            {ramp.map((stop, i) => (
              <div
                key={`${stop}-${i}`}
                className="flex-1 border-l border-stroke first:border-l-0"
                style={{ backgroundColor: stop }}
              />
            ))}
          </div>
          <div className="hidden border-t border-stroke sm:flex">
            {ramp.map((stop, i) => (
              <div
                key={`label-${stop}-${i}`}
                className="tnum flex-1 border-l border-stroke px-1 py-2 text-center text-[10px] text-faint first:border-l-0"
              >
                {stop.toUpperCase()}
              </div>
            ))}
          </div>
        </figure>
      ) : null}

      <Lightbox
        images={images}
        index={open}
        captionFor={captionFor}
        onClose={() => setOpen(null)}
        onIndexChange={(i) => {
          setOpen(i);
          setSelected(i);
        }}
      />
    </div>
  );
}
