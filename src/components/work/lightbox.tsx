"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Minimal image viewer. Escape closes, arrows step, Tab stays inside the
 * dialog, and the trigger gets focus back on close.
 */
export function Lightbox({
  images,
  index,
  captionFor,
  onClose,
  onIndexChange,
}: {
  images: string[];
  index: number | null;
  captionFor: (i: number) => string;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const open = index !== null && images.length > 0;

  React.useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => surfaceRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open]);

  React.useEffect(() => {
    if (!open || index === null) return;
    const count = images.length;
    const current = index;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight" && count > 1) {
        event.preventDefault();
        onIndexChange((current + 1) % count);
        return;
      }
      if (event.key === "ArrowLeft" && count > 1) {
        event.preventDefault();
        onIndexChange((current - 1 + count) % count);
        return;
      }
      if (event.key !== "Tab") return;

      const surface = surfaceRef.current;
      if (!surface) return;
      const stops = Array.from(surface.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (stops.length === 0) {
        event.preventDefault();
        return;
      }
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === surface)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, index, images, onClose, onIndexChange]);

  const fade = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  return (
    <AnimatePresence>
      {open && index !== null ? (
        <motion.div
          {...fade}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-void/95 backdrop-blur-sm"
          onClick={onClose}
        >
          <div
            ref={surfaceRef}
            role="dialog"
            aria-modal="true"
            aria-label={captionFor(index)}
            tabIndex={-1}
            className="relative flex h-full w-full flex-col outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stroke px-4 py-3 md:px-6">
              <p className="label truncate">{captionFor(index)}</p>
              <div className="flex items-center gap-1">
                {images.length > 1 ? (
                  <>
                    <span className="tnum mr-2 text-[11px] text-faint">
                      {index + 1} / {images.length}
                    </span>
                    <button
                      type="button"
                      aria-label="Previous frame"
                      onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
                      className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/60 hover:text-cyan"
                    >
                      <ChevronLeft size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next frame"
                      onClick={() => onIndexChange((index + 1) % images.length)}
                      className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/60 hover:text-cyan"
                    >
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  aria-label="Close viewer"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-stroke text-muted transition-colors hover:border-cyan/60 hover:text-cyan"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
              {/* Sources are as small as 320x180 — never enlarge past what they hold. */}
              <div className="relative h-full w-full max-w-[1120px]">
                <Image
                  key={images[index]}
                  src={images[index]}
                  alt={captionFor(index)}
                  fill
                  sizes="(min-width: 1200px) 1120px, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
