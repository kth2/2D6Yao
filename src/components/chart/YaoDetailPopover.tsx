import type { LiuyaoYaoDetail } from '@/engine/types'

const flagLabels: Array<[keyof LiuyaoYaoDetail, string]> = [
  ['isDayBreak', '日破'],
  ['isMonthBreak', '月破'],
  ['isDayClash', '暗动/日冲'],
  ['isHiddenMove', '暗动'],
  ['isSanxing', '三刑'],
  ['isLiuhe', '六合'],
  ['isLiuhai', '六害'],
  ['isRuMu', '入墓'],
  ['isDongMu', '动墓'],
  ['isHuaMu', '化墓'],
]

export function YaoDetailPopover({ yao }: { yao: LiuyaoYaoDetail }) {
  const activeFlags = flagLabels.filter(([key]) => yao[key])

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-text-muted">
        <span>旺衰</span>
        <span className="text-text">{yao.seasonState ?? '—'}</span>
        <span>化进退</span>
        <span className="text-text">{yao.changeDirection ?? '—'}</span>
        {yao.changeRelations && yao.changeRelations.length > 0 && (
          <>
            <span>动变关系</span>
            <span className="text-text">{yao.changeRelations.join('、')}</span>
          </>
        )}
        {yao.changedYao && (
          <>
            <span>变爻</span>
            <span className="text-text">
              {yao.changedYao.dizhi}
              {yao.changedYao.wuxing} {yao.changedYao.liuqin}
              {yao.changedYao.isVoid ? '（空）' : ''}
            </span>
          </>
        )}
      </div>
      {activeFlags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFlags.map(([key, label]) => (
            <span
              key={key}
              className="rounded-full bg-broken/15 px-2 py-0.5 text-xs text-broken"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
