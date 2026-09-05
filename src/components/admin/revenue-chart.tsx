import { formatPrice } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 'YYYY-MM-DD' -> 'Sep 5', without the UTC-midnight timezone slip. */
function shortDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}`;
}

/**
 * Hand-drawn SVG area chart — no chart library. Renders correctly when every
 * value is zero (flat line on the baseline).
 */
export function RevenueChart({
  data,
  days,
}: {
  data: { day: string; total: number }[];
  days: number;
}) {
  const rows = data.map((d) => ({ day: d.day, total: Number(d.total) || 0 }));
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  const peak = rows.reduce((hi, r) => Math.max(hi, r.total), 0);

  const W = 720;
  const H = 190;
  const PAD_T = 14;
  const PAD_B = 10;
  const plotH = H - PAD_T - PAD_B;
  const baseline = H - PAD_B;
  const scaleMax = peak > 0 ? peak : 1;

  const pts = rows.length === 1 ? [rows[0], rows[0]] : rows;
  const x = (i: number) => (pts.length <= 1 ? 0 : (i / (pts.length - 1)) * W);
  const y = (v: number) => PAD_T + plotH - (v / scaleMax) * plotH;

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(p.total).toFixed(2)}`).join(" ");
  const area = `${line} L${W},${baseline} L0,${baseline} Z`;

  const label = `Revenue over the last ${days} days. Total ${formatPrice(total)}, best day ${formatPrice(peak)}.`;

  return (
    <div>
      <div className="flex items-end justify-between gap-4 px-5 pt-4">
        <div>
          <p className="label">Revenue, last {days} days</p>
          <p className="display-tight tnum mt-1 text-[26px] text-ink">{formatPrice(total)}</p>
        </div>
        <p className="tnum text-[12px] text-faint">Peak {formatPrice(peak)}</p>
      </div>

      <div className="relative mt-3 px-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={label}
          className="block h-[190px] w-full overflow-visible"
        >
          <title>{label}</title>
          <defs>
            <linearGradient id="rr-revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Quarter gridlines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1="0"
              x2={W}
              y1={PAD_T + plotH * t}
              y2={PAD_T + plotH * t}
              stroke="#1f1f23"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <path d={area} fill="url(#rr-revenue-fill)" />
          <path
            d={line}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {pts.map((p, i) =>
            p.total > 0 ? (
              <circle
                key={`${p.day}-${i}`}
                cx={x(i)}
                cy={y(p.total)}
                r="2.5"
                fill="#08080a"
                stroke="#22d3ee"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ) : null
          )}

          <line
            x1="0"
            x2={W}
            y1={baseline}
            y2={baseline}
            stroke="#2c2c33"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {peak === 0 ? (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[12px] text-faint">
            No completed orders in this window yet.
          </p>
        ) : null}
      </div>

      <div className="tnum mt-2 flex items-center justify-between px-5 pb-4 text-[11px] text-faint">
        <span>{rows.length ? shortDay(rows[0].day) : ""}</span>
        <span className="hidden sm:inline">
          {rows.length ? shortDay(rows[Math.floor((rows.length - 1) / 2)].day) : ""}
        </span>
        <span>{rows.length ? shortDay(rows[rows.length - 1].day) : ""}</span>
      </div>
    </div>
  );
}
