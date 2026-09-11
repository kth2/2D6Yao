import { getHexagramByLines } from '@/engine/hexagramTable'
import { partsFromYaoValue, toChangedLines, toLines, type YaoValue } from '@/engine/yaoValue'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

/** 排卦过程中的实时结果：本卦、动爻、以及动爻变出的变卦。 */
export function HexagramPreview({ yaos }: { yaos: readonly YaoValue[] }) {
  const original = getHexagramByLines(toLines(yaos))
  const movingPositions = yaos
    .map((value, index) => (partsFromYaoValue(value).moving ? index + 1 : 0))
    .filter((position) => position > 0)
  const changed = movingPositions.length > 0 ? getHexagramByLines(toChangedLines(yaos)) : null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-surface px-3 py-2 text-sm">
      <span className="text-text-muted">
        本卦 <span className="font-medium text-text">{original?.name ?? '—'}</span>
      </span>
      {changed ? (
        <>
          <span className="text-text-muted">
            动爻{' '}
            <span className="text-moving">
              {movingPositions.map((position) => positionLabels[position - 1]).join('、')}
            </span>
          </span>
          <span className="text-text-muted">
            变卦 <span className="font-medium text-text">{changed.name}</span>
          </span>
        </>
      ) : (
        <span className="text-text-muted">静卦（未选动爻）</span>
      )}
    </div>
  )
}
