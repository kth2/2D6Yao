import type { ChartTag } from '@/engine/chartTags'
import type { RuleMatch } from '@/engine/corpus'

/** 命中的断法条文；标签重合度越高、标签越少见，排得越前。 */
export function RuleMatches({
  matches,
  tags,
}: {
  matches: readonly RuleMatch[]
  tags: readonly ChartTag[]
}) {
  const labelOf = (id: string) => tags.find((tag) => tag.id === id)?.label ?? id

  if (matches.length === 0) {
    return <p className="text-sm text-text-muted">该事类下没有与本卦标签重合的条文。</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {matches.map(({ rule, sharedTags }) => (
        <div key={rule.id} className="flex flex-col gap-1.5 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span>{rule.chapter_name}</span>
            {rule.topic && <span>· {rule.topic}</span>}
            <span className="ml-auto">{rule.id}</span>
          </div>
          <p className="text-sm">{rule.text}</p>
          <div className="flex flex-wrap gap-1.5">
            {sharedTags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs">
                {labelOf(tag)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
