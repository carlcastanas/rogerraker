"use client";

import Image from "next/image";
import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const REST = 58;
const STEP = 2;
const COARSE_STEP = 10;

/** Flat log: desaturated, low contrast, lifted. What comes off the card. */
const BEFORE_FILTER = "saturate(.35) contrast(.72) brightness(1.12)";
/** The graded original, nudged rather than re-invented. */
const AFTER_FILTER = "saturate(1.06) contrast(1.05)";

function clamp(n: number) {
  return Math.min(100, Math.max(0, n));
}

export function GradeSlider({
  beforeImage,
  afterImage,
  frameNote,
  beforeLabel = "Straight out of camera",
  afterLabel = "With the LUT pack",
  className,
}: {
  beforeImage: string;
  afterImage: string;
  frameNote?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const frameRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const x = useMotionValue(0);
  const [readout, setReadout] = React.useState(0);
  const [grabbing, setGrabbing] = React.useState(false);

  useMotionValueEvent(x, "change", (v) => setReadout(Math.round(v)));

  const clip = useTransform(x, (v) => `inset(0 ${(100 - v).toFixed(2)}% 0 0)`);
  const left = useTransform(x, (v) => `${v.toFixed(2)}%`);

  /* The one orchestrated moment on the page: the wipe opening to rest.
     Guarding on the motion value rather than a ref, so React's development
     double-invoke resumes the animation instead of leaving it stopped at 0. */
  React.useEffect(() => {
    if (reduced) {
      x.set(REST);
      return;
    }
    if (x.get() >= REST) return;
    const controls = animate(x, REST, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [reduced, x]);

  const setFromClientX = React.useCallback(
    (clientX: number) => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      x.set(clamp(((clientX - rect.left) / rect.width) * 100));
    },
    [x]
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    setGrabbing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setFromClientX(event.clientX);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setGrabbing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const current = x.get();
    let next: number | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current - STEP;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current + STEP;
    if (event.key === "PageDown") next = current - COARSE_STEP;
    if (event.key === "PageUp") next = current + COARSE_STEP;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 100;
    if (next === null) return;
    event.preventDefault();
    x.set(clamp(next));
  };

  const sizes = "(min-width: 1024px) 46vw, 100vw";

  return (
    <figure className={cn("w-full", className)}>
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "relative aspect-video w-full select-none overflow-hidden border border-stroke bg-panel",
          grabbing ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ touchAction: "pan-y" }}
      >
        {/* Flat log pass — everything left of the wipe */}
        <Image
          src={beforeImage}
          alt="A frame from Sana Merong Tayo before any grading"
          fill
          priority
          sizes={sizes}
          className="object-cover"
          style={{ filter: BEFORE_FILTER }}
        />
        {/* Lifted blacks: the milky floor log footage arrives with */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[rgba(127,138,156,0.16)] mix-blend-screen"
        />

        {/* Graded pass — clipped to the wipe */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <Image
            src={afterImage}
            alt="The same frame with the LUT pack applied"
            fill
            priority
            sizes={sizes}
            className="object-cover"
            style={{ filter: AFTER_FILTER }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(34,211,238,.10) 0%, rgba(8,8,10,0) 42%, rgba(8,8,10,.42) 100%)",
            }}
          />
        </motion.div>

        {/* Side labels */}
        <span className="pointer-events-none absolute left-3 top-3 z-20 border border-[#ff6a3d]/35 bg-void/70 px-2 py-0.5 text-[11px] leading-5 text-ember backdrop-blur-sm md:left-4 md:top-4">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 z-20 border border-cyan/35 bg-void/70 px-2 py-0.5 text-[11px] leading-5 text-cyan backdrop-blur-sm md:right-4 md:top-4">
          {afterLabel}
        </span>

        {/* Wipe handle */}
        <motion.div
          className="absolute inset-y-0 z-30 w-px -translate-x-1/2 bg-cyan"
          style={{ left, boxShadow: "0 0 18px rgba(34,211,238,.55)" }}
        >
          <button
            type="button"
            role="slider"
            aria-label="Grade comparison wipe"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={readout}
            aria-valuetext={`${readout} percent graded`}
            onKeyDown={onKeyDown}
            className={cn(
              "absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan/60 bg-void/85 text-cyan backdrop-blur-sm transition-colors hover:bg-cyan hover:text-[#04141a]",
              grabbing ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <MoveHorizontal size={16} strokeWidth={1.5} />
          </button>
        </motion.div>

        {/* Wipe readout */}
        <span className="pointer-events-none absolute bottom-3 right-3 z-20 border border-stroke-strong bg-void/70 px-2 py-0.5 text-[11px] leading-5 text-muted backdrop-blur-sm md:bottom-4 md:right-4">
          <span className="tnum">{readout}</span>% graded
        </span>
      </div>

      {frameNote ? (
        <figcaption className="mt-3 max-w-[52ch] text-[13px] leading-relaxed text-muted">
          {frameNote}
        </figcaption>
      ) : null}
    </figure>
  );
}
