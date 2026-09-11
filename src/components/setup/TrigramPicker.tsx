import { getTrigramByLines, listTrigrams, type Trigram } from '@/engine/hexagramTable'
import { applyLines, toLines, type YaoValue } from '@/engine/yaoValue'
import { cn } from '@/lib/utils'

const trigrams = listTrigrams()

function TrigramGroup({
  label,
  hint,
  selectedName,
  onSelect,
}: {
  label: string
  hint: string
  selectedName?: string
  onSelect: (trigram: Trigram) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-text-muted">
        {label} <span className="text-xs">{hint}</span>
      </span>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {trigrams.map((trigram) => (
          <button
            key={trigram.name}
            onClick={() => onSelect(trigram)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-md border px-2 py-1.5 transition-colors',
              selectedName === trigram.name
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border hover:bg-surface',
            )}
          >
            <span className="text-lg leading-none">{trigram.symbol}</span>
            <span className="text-xs whitespace-nowrap">
              {trigram.name}
              {trigram.nature}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** 自行排列卦象：分别点选上卦与下卦，动爻标记保持不变。 */
export function TrigramPicker({
  yaos,
  onChange,
}: {
  yaos: readonly YaoValue[]
  onChange: (yaos: YaoValue[]) => void
}) {
  const lines = toLines(yaos)
  const upper = getTrigramByLines(lines.slice(3, 6))
  const lower = getTrigramByLines(lines.slice(0, 3))

  return (
    <div className="flex flex-col gap-3">
      <TrigramGroup
        label="上卦（外卦）"
        hint="四爻至上爻"
        selectedName={upper?.name}
        onSelect={(trigram) => onChange(applyLines(yaos, trigram.lines, 3))}
      />
      <TrigramGroup
        label="下卦（内卦）"
        hint="初爻至三爻"
        selectedName={lower?.name}
        onSelect={(trigram) => onChange(applyLines(yaos, trigram.lines, 0))}
      />
    </div>
  )
}
