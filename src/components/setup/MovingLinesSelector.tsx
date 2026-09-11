import { partsFromYaoValue, yaoValueFromParts, type YaoValue } from '@/engine/yaoValue'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

/** 只切换「是否动爻」，阴阳保持不变；用于选卦后再勾动爻，或嵌入手动输入。 */
export function MovingLinesSelector({
  yaos,
  onChange,
}: {
  yaos: readonly YaoValue[]
  onChange: (yaos: YaoValue[]) => void
}) {
  return (
    <div className="flex flex-col-reverse gap-1">
      {yaos.map((value, index) => {
        const { yang, moving } = partsFromYaoValue(value)
        return (
          <label
            key={index}
            className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
          >
            <span className="text-text-muted">{positionLabels[index]}</span>
            <span>{yang ? '⚊ 阳' : '⚋ 阴'}</span>
            <span className="flex items-center gap-1.5">
              动爻
              <input
                type="checkbox"
                checked={moving}
                onChange={(e) => {
                  const next = [...yaos]
                  next[index] = yaoValueFromParts(yang, e.target.checked)
                  onChange(next)
                }}
              />
            </span>
          </label>
        )
      })}
    </div>
  )
}
