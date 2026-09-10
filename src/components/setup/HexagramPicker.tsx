import { listHexagramNames } from '@/engine/hexagramTable'

const names = listHexagramNames()

/** 按卦名或 1-64 编号直接选定本卦；起始为全静爻，动爻另用 MovingLinesSelector 勾选。 */
export function HexagramPicker({ onSelect }: { onSelect: (name: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
      <span className="text-text-muted">本卦</span>
      <select defaultValue="" onChange={(e) => e.target.value && onSelect(e.target.value)}>
        <option value="" disabled>
          按卦名选择（共 {names.length} 卦）
        </option>
        {names.map((name, index) => (
          <option key={name} value={name}>
            {index + 1}. {name}
          </option>
        ))}
      </select>
    </div>
  )
}
