import { partsFromYaoValue, yaoValueFromParts, type YaoValue } from '@/engine/yaoValue'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

/** 逐爻手动输入：阴阳 + 是否动爻，等价于直接给出 6/7/8/9。 */
export function ManualLineInput({
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
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-1.5 text-sm"
          >
            <span className="text-text-muted">{positionLabels[index]}</span>
            <select
              value={yang ? 'yang' : 'yin'}
              onChange={(e) => {
                const next = [...yaos]
                next[index] = yaoValueFromParts(e.target.value === 'yang', moving)
                onChange(next)
              }}
            >
              <option value="yang">阳</option>
              <option value="yin">阴</option>
            </select>
            <label className="flex items-center gap-1.5">
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
            </label>
          </div>
        )
      })}
    </div>
  )
}
