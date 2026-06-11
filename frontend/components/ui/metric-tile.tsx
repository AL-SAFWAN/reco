"use client"
export function MetricTile({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number | React.ReactNode
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 border-r border-background/15 pr-6 last:border-0 last:pr-0">
      <span className="text-[11px] font-semibold tracking-widest text-background/50 uppercase">
        {label}
      </span>
      <span className="text-3xl font-black text-background tabular-nums">
        {value}
      </span>
      {sub && <span className="text-xs text-background/40">{sub}</span>}
    </div>
  )
}
