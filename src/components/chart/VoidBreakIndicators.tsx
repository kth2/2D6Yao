import type { LiuyaoChart } from '@/engine/liuyao'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

export function VoidBreakIndicators({ liuyao }: { liuyao: LiuyaoChart }) {
  const flagged = liuyao.yaosDetail.filter(
    (y) => y.isVoid || y.isDayBreak || y.isMonthBreak || y.isHiddenMove,
  )

  if (flagged.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 text-xs">
      {flagged.map((y) => (
        <span key={y.position} className="rounded-full bg-void/15 px-2 py-0.5 text-void">
          {positionLabels[y.position - 1]}
          {y.isVoid && ' 空亡'}
          {y.isMonthBreak && ' 月破'}
          {y.isDayBreak && ' 日破'}
          {y.isHiddenMove && ' 暗动'}
        </span>
      ))}
    </div>
  )
}
