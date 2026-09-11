import type { LiuyaoChart } from '@/engine/liuyao'

export function RelationsPanel({ liuyao }: { liuyao: LiuyaoChart }) {
  const labels = [
    ...(liuyao.hexagramRelations?.original ? [`本卦${liuyao.hexagramRelations.original}`] : []),
    ...(liuyao.hexagramRelations?.changed ? [`变卦${liuyao.hexagramRelations.changed}`] : []),
    ...(liuyao.fanfuRelations?.labels ?? []),
    ...(liuyao.sanheWithDay ? [`日${liuyao.sanheWithDay.description}`] : []),
    ...(liuyao.sanheWithMonth ? [`月${liuyao.sanheWithMonth.description}`] : []),
    ...(liuyao.sanxingInYaos ?? []).map((s) => s.type),
  ]

  if (labels.length === 0 && !liuyao.specialAdvice) return null

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border p-3 text-sm">
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {labels.map((label, i) => (
            <span key={i} className="rounded-full bg-surface px-2 py-0.5 text-xs">
              {label}
            </span>
          ))}
        </div>
      )}
      {liuyao.specialAdvice && <p className="text-text-muted">{liuyao.specialAdvice}</p>}
    </div>
  )
}
