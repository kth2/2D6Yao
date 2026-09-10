import type { BaseGanZhi } from '@/engine/types'

export function FourPillarsBar({
  ganzhi,
  voidBranches,
}: {
  ganzhi: BaseGanZhi
  voidBranches: readonly string[]
}) {
  const pillars: Array<[string, string]> = [
    ['年', ganzhi.year],
    ['月', ganzhi.month],
    ['日', ganzhi.day],
    ['时', ganzhi.hour],
  ]

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
      {pillars.map(([label, value]) => (
        <span key={label}>
          {label}柱 <span className="text-text">{value}</span>
        </span>
      ))}
      {voidBranches.length > 0 && (
        <span>
          旬空 <span className="text-void">{voidBranches.join('')}</span>
        </span>
      )}
    </div>
  )
}
