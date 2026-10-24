export type Point = { second: number; wpm: number; raw: number };

const W = 640;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

export function WpmChart({ points }: { points: Point[] }) {
  if (points.length < 2) return null;

  const maxSecond = points[points.length - 1].second;
  const maxWpm = Math.max(...points.map((p) => Math.max(p.wpm, p.raw)), 10);
  const top = Math.ceil(maxWpm / 20) * 20;

  const x = (s: number) =>
    PAD.left + ((s - 1) / Math.max(1, maxSecond - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => H - PAD.bottom - (v / top) * (H - PAD.top - PAD.bottom);

  const line = (key: "wpm" | "raw") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.second)},${y(p[key])}`).join(" ");

  const ticks = [0, top / 2, top];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="WPM over time">
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            className="stroke-sub/20"
          />
          <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-sub text-[11px]">
            {t}
          </text>
        </g>
      ))}

      <text x={x(1)} y={H - 8} className="fill-sub text-[11px]">1s</text>
      <text x={x(maxSecond)} y={H - 8} textAnchor="end" className="fill-sub text-[11px]">
        {maxSecond}s
      </text>

      <path
        d={line("raw")}
        pathLength={1}
        className="animate-draw fill-none stroke-sub/50 stroke-[1.5]"
      />
      <path
        d={line("wpm")}
        pathLength={1}
        className="animate-draw fill-none stroke-accent stroke-[2.5]"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
