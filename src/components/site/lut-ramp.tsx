import { cn } from "@/lib/utils";

const FALLBACK = ["#1b2430", "#3f5b6b", "#8fa6a8", "#d8c7ad", "#f2e6d2"];

/**
 * The colour signature of a look, read left to right: shadows through
 * highlights. Thin band, hairline ticks, no decoration beyond the data.
 */
export function LutRamp({
  stops,
  className,
  label,
}: {
  stops?: string[] | null;
  className?: string;
  label?: string;
}) {
  const ramp = stops && stops.length > 1 ? stops : FALLBACK;
  const gradient = `linear-gradient(90deg, ${ramp.join(", ")})`;

  return (
    <div className={cn("w-full", className)}>
      {label ? <span className="label mb-1.5 block">{label}</span> : null}
      <div
        className="relative h-2.5 w-full border-y border-stroke"
        style={{ backgroundImage: gradient }}
        role="img"
        aria-label={`Colour ramp: ${ramp.length} stops from ${ramp[0]} to ${ramp[ramp.length - 1]}`}
      >
        <div className="absolute inset-0 flex justify-between">
          {ramp.map((hex, i) => (
            <span
              key={`${hex}-${i}`}
              className="h-full w-px bg-void/35 first:opacity-0 last:opacity-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
