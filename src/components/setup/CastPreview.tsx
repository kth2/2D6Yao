import { getHexagramByLines } from '@/engine/hexagramTable'
import { partsFromYaoValue, type YaoValue } from '@/engine/yaoValue'
import type { NumberCast } from '@/engine/numberCast'

const positionLabels = ['初', '二', '三', '四', '五', '上']

/** 起卦结果预览：上下卦、动爻与推出的本卦名，生成前先让用户核对。 */
export function CastPreview({ cast }: { cast: NumberCast }) {
  const lines = cast.yaos.map((value: YaoValue) => (partsFromYaoValue(value).yang ? 1 : 0) as 0 | 1)
  const hexagram = getHexagramByLines(lines)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-surface px-3 py-2 text-sm">
      <span className="text-text-muted">
        上卦 <span className="text-text">{cast.upperTrigram}</span>
      </span>
      <span className="text-text-muted">
        下卦 <span className="text-text">{cast.lowerTrigram}</span>
      </span>
      <span className="text-text-muted">
        动爻 <span className="text-moving">{positionLabels[cast.movingLine - 1]}爻</span>
      </span>
      {hexagram && <span className="font-medium">→ {hexagram.name}</span>}
    </div>
  )
}
