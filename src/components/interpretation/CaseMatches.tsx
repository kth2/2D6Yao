import { useState } from 'react'
import type { ChartTag } from '@/engine/chartTags'
import type { CaseMatch } from '@/engine/corpus'

function CaseCard({ match, tags }: { match: CaseMatch; tags: readonly ChartTag[] }) {
  const [open, setOpen] = useState(false)
  const { entry, sharedTags, sameHexagram } = match
  const labelOf = (id: string) => tags.find((tag) => tag.id === id)?.label ?? id
  const { sizhu } = entry

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>{entry.chapter_name}</span>
        {entry.gua && (
          <span className={sameHexagram ? 'text-accent' : undefined}>
            {entry.gua.ben}
            {entry.gua.bian ? ` → ${entry.gua.bian}` : ''}
            {sameHexagram ? '（同本卦）' : ''}
          </span>
        )}
        {entry.gua?.confidence && entry.gua.confidence !== 'high' && (
          <span title="卦盘由 OCR 识别，置信度见 SCHEMA.md">卦名{entry.gua.confidence}</span>
        )}
        <span className="ml-auto">
          #{entry.seq} · p{entry.page}
        </span>
      </div>

      <p className="text-sm font-medium">{entry.question_raw}</p>
      <p className="text-xs text-text-muted">
        {sizhu.year} {sizhu.month} {sizhu.day} {sizhu.hour}
        {entry.xunkong.length > 0 && `（${entry.xunkong.join('')}空）`}
      </p>

      <p className={'text-sm ' + (open ? '' : 'line-clamp-3')}>{entry.analysis}</p>
      {open && entry.note && (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-text-muted">
          注释：{entry.note}
        </p>
      )}
      {open &&
        entry.yingqi.map((item, index) => (
          <p key={index} className="text-sm text-text-muted">
            应期 {item.ganzhi}：{item.text}
          </p>
        ))}

      <div className="flex flex-wrap items-center gap-1.5">
        {sharedTags.map((tag) => (
          <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs">
            {labelOf(tag)}
          </span>
        ))}
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto text-xs text-accent hover:underline"
        >
          {open ? '收起' : '展开全文'}
        </button>
      </div>
    </div>
  )
}

/** 资料库里与本卦相似的书例：同卦不同断最见功夫，故同本卦优先。 */
export function CaseMatches({
  matches,
  tags,
}: {
  matches: readonly CaseMatch[]
  tags: readonly ChartTag[]
}) {
  if (matches.length === 0) {
    return <p className="text-sm text-text-muted">没有检索到相近的书例。</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {matches.map((match) => (
        <CaseCard key={match.entry.seq} match={match} tags={tags} />
      ))}
    </div>
  )
}
