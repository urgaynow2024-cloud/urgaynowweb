export function BarChart({
  data,
  labels,
  accent = "#a256bb",
  height = 180,
  className = "",
}: {
  data: number[];
  labels?: string[];
  accent?: string;
  height?: number;
  className?: string;
}) {
  const max = Math.max(...data, 1);
  const w = 600;
  const h = height;
  const gap = 10;
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full ${className}`} preserveAspectRatio="none" role="img" aria-label="Bar chart">
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 24);
        const x = i * (bw + gap);
        const y = h - bh - 20;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={4} fill="url(#bar-grad)">
              <title>{labels?.[i] ? `${labels[i]}: ${v}` : `${v}`}</title>
            </rect>
            {labels && (
              <text x={x + bw / 2} y={h - 6} textAnchor="middle" className="fill-ink-400" style={{ fontSize: 10 }}>
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function MiniAreaChart({ data, accent = "#a256bb", height = 120 }: { data: number[]; accent?: string; height?: number }) {
  const w = 300;
  const h = height;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#area-grad)" />
      <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
