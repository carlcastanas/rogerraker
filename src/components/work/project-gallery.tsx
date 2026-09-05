"use client";

import * as React from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { Lightbox } from "@/components/work/lightbox";

/**
 * Storyboard frames straight from the video, 320x180. They are small on
 * purpose, so the strip is capped rather than stretched — a frame is never
 * blown up past roughly its own resolution.
 */
export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const captionFor = React.useCallback(
    (i: number) => `${title}, frame ${i + 1} of ${images.length}`,
    [title, images.length]
  );

  if (images.length === 0) return null;

  return (
    <>
      <ul className="mt-6 flex max-w-[1040px] flex-wrap gap-3 sm:gap-4">
        {images.map((src, i) => (
          <li
            key={src}
            className="w-[calc(50%_-_0.375rem)] sm:w-[calc(33.333%_-_0.667rem)]"
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block aspect-video w-full overflow-hidden border border-stroke transition-colors hover:border-cyan/50"
              aria-label={`Open ${captionFor(i)}`}
            >
              <Image
                src={src}
                alt={`${title}, frame ${i + 1}`}
                fill
                sizes="(min-width: 640px) 340px, 50vw"
                className="object-cover"
              />
              <span className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1.5 rounded-[2px] border border-stroke-strong bg-void/85 px-2 py-1 text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 size={12} strokeWidth={1.5} aria-hidden />
                <span className="tnum">{i + 1}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        images={images}
        index={open}
        captionFor={captionFor}
        onClose={() => setOpen(null)}
        onIndexChange={setOpen}
      />
    </>
  );
}
