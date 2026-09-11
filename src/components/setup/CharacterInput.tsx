import { useEffect, useState } from 'react'
import { analyzeKangxiStrokes, type StrokeAnalysis } from '@/engine/strokes'
import { castFromStrokes, type StrokeCast } from '@/engine/numberCast'
import { CastPreview } from './CastPreview'

interface LookupResult {
  text: string
  analysis: StrokeAnalysis | null
}

function castOf(analysis: StrokeAnalysis | null): StrokeCast | null {
  if (!analysis) return null
  return castFromStrokes(analysis.characters.map((item) => item.strokes))
}

/** 以字画起卦：按康熙笔画数，字数均分为上下卦，总笔画取动爻。 */
export function CharacterInput({ onCast }: { onCast: (cast: StrokeCast | null) => void }) {
  const [text, setText] = useState('')
  const [lookup, setLookup] = useState<LookupResult | null>(null)

  const trimmed = text.trim()
  const enough = trimmed.length >= 2
  const current = lookup && lookup.text === trimmed ? lookup : null

  useEffect(() => {
    const value = text.trim()
    if (value.length < 2) return

    let cancelled = false
    analyzeKangxiStrokes(value).then(
      (analysis) => {
        if (cancelled) return
        setLookup({ text: value, analysis })
        onCast(castOf(analysis))
      },
      () => {
        if (cancelled) return
        setLookup({ text: value, analysis: null })
      },
    )
    return () => {
      cancelled = true
    }
  }, [text, onCast])

  const analysis = current?.analysis ?? null
  const failed = current !== null && current.analysis === null
  const loading = enough && current === null
  const cast = castOf(analysis)

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
        <span className="shrink-0 text-text-muted">汉字</span>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onCast(null)
          }}
          placeholder="至少两个字，如「问财」"
          className="w-full bg-transparent outline-none"
        />
      </label>

      {loading && <p className="text-sm text-text-muted">正在载入字库…</p>}
      {failed && <p className="text-sm text-text-muted">字库载入失败，请重试。</p>}

      {analysis && analysis.characters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-sm">
          {analysis.characters.map((item, index) => (
            <span key={index} className="rounded-md border border-border px-2 py-0.5">
              {item.char} <span className="text-text-muted">{item.strokes} 画</span>
            </span>
          ))}
        </div>
      )}
      {analysis && analysis.unknown.length > 0 && (
        <p className="text-sm text-text-muted">字库中无此字，已忽略：{analysis.unknown.join('')}</p>
      )}

      {cast && <CastPreview cast={cast} />}
    </div>
  )
}
