"use client";

import * as React from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { cn } from "@/lib/utils";

const FRAME_COUNT = 61;
const FRAME_DIR = "/media/camera-frames";
const POSTER_SRC = `${FRAME_DIR}/poster.webp`;

function frameSrc(i: number) {
  return `${FRAME_DIR}/frame-${String(i + 1).padStart(3, "0")}.webp`;
}

/**
 * Scroll-scrub camera between Hero and Films.
 * Layout mirrors joshmojica.io ScrollSequence: tall track + sticky full-viewport
 * stage, canvas frame paint. Camera stays contain-fit (keyed subject).
 */
export function CameraScroll({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const trackRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [nearView, setNearView] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const cacheRef = React.useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: FRAME_COUNT }, () => null)
  );
  const targetIndex = React.useRef(0);
  const paintedIndex = React.useRef(-1);
  const rafId = React.useRef<number | null>(null);
  const loadingRef = React.useRef(false);
  const sizeRef = React.useRef({ w: 0, h: 0 });

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => setNearView(entry.isIntersecting),
      { rootMargin: "120% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const draw = React.useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frame = cacheRef.current[index];
    if (!frame?.complete || frame.naturalWidth === 0) {
      for (let d = 1; d < FRAME_COUNT; d += 1) {
        const lo = cacheRef.current[index - d];
        const hi = cacheRef.current[index + d];
        if (lo?.complete && lo.naturalWidth > 0) {
          frame = lo;
          break;
        }
        if (hi?.complete && hi.naturalWidth > 0) {
          frame = hi;
          break;
        }
      }
    }
    if (!frame?.complete || frame.naturalWidth === 0) return;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const cssW = canvas.clientWidth || frame.naturalWidth;
    const cssH = canvas.clientHeight || frame.naturalHeight;
    const pxW = Math.max(1, Math.round(cssW * dpr));
    const pxH = Math.max(1, Math.round(cssH * dpr));

    if (sizeRef.current.w !== pxW || sizeRef.current.h !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
      sizeRef.current = { w: pxW, h: pxH };
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // contain-fit — keep the full keyed camera visible
    const scale = Math.min(pxW / frame.naturalWidth, pxH / frame.naturalHeight);
    const dw = frame.naturalWidth * scale;
    const dh = frame.naturalHeight * scale;
    const dx = (pxW - dw) / 2;
    const dy = (pxH - dh) / 2;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, pxW, pxH);
    ctx.drawImage(frame, dx, dy, dw, dh);
    paintedIndex.current = index;
  }, []);

  const flush = React.useCallback(() => {
    rafId.current = null;
    draw(targetIndex.current);
  }, [draw]);

  React.useEffect(() => {
    if (reduced || !nearView || loadingRef.current) return;
    if (cacheRef.current.every((img) => img?.complete && img.naturalWidth > 0)) {
      setReady(true);
      draw(targetIndex.current);
      return;
    }

    let cancelled = false;
    loadingRef.current = true;

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const existing = cacheRef.current[i];
        if (existing?.complete && existing.naturalWidth > 0) {
          resolve();
          return;
        }
        const img = new Image();
        img.decoding = "async";
        img.src = frameSrc(i);
        const done = () => {
          if (!cancelled) cacheRef.current[i] = img;
          resolve();
        };
        img.onload = done;
        img.onerror = done;
      });

    (async () => {
      await loadOne(0);
      if (cancelled) return;
      setReady(true);
      draw(targetIndex.current);

      let next = 1;
      const CONCURRENCY = 12;
      await Promise.all(
        Array.from({ length: CONCURRENCY }, async () => {
          while (next < FRAME_COUNT && !cancelled) {
            const i = next++;
            await loadOne(i);
          }
        })
      );
      loadingRef.current = false;
      if (!cancelled) draw(targetIndex.current);
    })();

    return () => {
      cancelled = true;
      loadingRef.current = false;
    };
  }, [nearView, reduced, draw]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    const idx = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.round(p * (FRAME_COUNT - 1)))
    );
    targetIndex.current = idx;
    if (idx === paintedIndex.current) return;
    if (rafId.current == null) {
      rafId.current = requestAnimationFrame(flush);
    }
  });

  React.useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  React.useEffect(() => {
    if (!ready || reduced) return;
    const onResize = () => {
      sizeRef.current = { w: 0, h: 0 };
      draw(targetIndex.current);
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => draw(targetIndex.current));
    return () => window.removeEventListener("resize", onResize);
  }, [ready, reduced, draw]);

  return (
    <section
      ref={trackRef}
      aria-label="Camera showcase"
      className={cn(
        "relative bg-void",
        // joshmojica uses ~300vh; we need less for 61 frames but enough to scrub
        reduced ? "h-auto" : "h-[220vh] sm:h-[240vh] md:h-[260vh]",
        className
      )}
    >
      {/* Soft fades into adjacent sections */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-24 bg-gradient-to-b from-void via-void/70 to-transparent md:h-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-24 bg-gradient-to-t from-void via-void/75 to-transparent md:h-32"
      />

      {/* Full-viewport sticky stage (joshmojica pattern) — no top-aligned dead space */}
      <div
        className={cn(
          "relative z-[2] w-full overflow-hidden bg-void",
          reduced
            ? "flex items-center justify-center px-5 py-12"
            : "sticky top-0 flex h-[100svh] items-center justify-center px-5"
        )}
      >
        <div className="relative w-full max-w-[min(94vw,28rem)] sm:max-w-[min(90vw,40rem)] md:max-w-[48rem]">
          <div className="relative aspect-[5/3] w-full sm:aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={POSTER_SRC}
              alt="Sony A7 III"
              width={1280}
              height={720}
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full object-contain",
                ready && !reduced ? "invisible" : "visible"
              )}
              aria-hidden={ready && !reduced}
            />

            {!reduced ? (
              <canvas
                ref={canvasRef}
                className={cn(
                  "absolute inset-0 h-full w-full",
                  ready ? "opacity-100" : "opacity-0"
                )}
                style={{ willChange: "contents" }}
                aria-hidden="true"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
