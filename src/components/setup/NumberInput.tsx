import { useState } from 'react'
import { castFromNumbers, type NumberCast } from '@/engine/numberCast'
import { CastPreview } from './CastPreview'

interface NumberFields {
  upper: string
  lower: string
  moving: string
}

const fieldMeta: Array<{ key: keyof NumberFields; label: string; hint: string }> = [
  { key: 'upper', label: '上卦数', hint: '除八取卦' },
  { key: 'lower', label: '下卦数', hint: '除八取卦' },
  { key: 'moving', label: '动爻数', hint: '留空则取两数之和' },
]

function parsePositive(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null
}

function castOf(fields: NumberFields): NumberCast | null {
  const upper = parsePositive(fields.upper)
  const lower = parsePositive(fields.lower)
  if (upper === null || lower === null) return null
  return castFromNumbers(upper, lower, parsePositive(fields.moving) ?? upper + lower)
}

/** 以数起卦：上卦数除八、下卦数除八、动爻数除六，不填动爻数则取两数之和。 */
export function NumberInput({ onCast }: { onCast: (cast: NumberCast | null) => void }) {
  const [fields, setFields] = useState<NumberFields>({ upper: '', lower: '', moving: '' })

  const update = (key: keyof NumberFields, value: string) => {
    const next = { ...fields, [key]: value }
    setFields(next)
    onCast(castOf(next))
  }

  const cast = castOf(fields)

  return (
    <div className="flex flex-col gap-3">
      {fieldMeta.map(({ key, label, hint }) => (
        <label
          key={key}
          className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm"
        >
          <span className="w-16 text-text-muted">{label}</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={fields[key]}
            onChange={(e) => update(key, e.target.value)}
            className="w-24 bg-transparent outline-none"
          />
          <span className="text-xs text-text-muted">{hint}</span>
        </label>
      ))}
      {cast && <CastPreview cast={cast} />}
    </div>
  )
}
