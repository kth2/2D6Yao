import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { YaoDetailPopover } from './YaoDetailPopover'
import type { LiuyaoYaoDetail } from '@/engine/types'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

export function YaoRow({
  yao,
  dizhi,
  wuxing,
  sixRelative,
  isVoid,
}: {
  yao: LiuyaoYaoDetail
  /** 展示用的纳甲地支/五行/六亲：本卦直接取 yao 自身字段，变卦侧在动爻时取 yao.changedYao。 */
  dizhi: string
  wuxing: string
  sixRelative: string
  isVoid: boolean
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={
            'grid w-full grid-cols-[3.5em_1.5em_1fr_1fr_1fr_1fr] items-center gap-2 rounded-md border border-border px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface' +
            (yao.isWorld || yao.isResponse ? ' font-medium' : '')
          }
        >
          <span className="text-text-muted">{positionLabels[yao.position - 1]}</span>
          <span>{yao.yaoType === '阳' ? '⚊' : '⚋'}</span>
          <span className={yao.isChanging ? 'text-moving' : undefined}>
            {yao.isChanging ? (yao.yaoType === '阳' ? '○' : '×') : ''}
          </span>
          <span className={isVoid ? 'text-void' : undefined}>
            {dizhi}
            {wuxing}
          </span>
          <span>{sixRelative}</span>
          <span className="text-text-muted">
            {yao.sixGod}
            {yao.isWorld ? ' 世' : ''}
            {yao.isResponse ? ' 应' : ''}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <YaoDetailPopover yao={yao} />
      </PopoverContent>
    </Popover>
  )
}
