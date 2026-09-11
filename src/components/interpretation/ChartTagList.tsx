import type { ChartTag } from '@/engine/chartTags'

/** 卦盘折算出的标签及其依据，匹配条文用的就是这些。 */
export function ChartTagList({ tags }: { tags: readonly ChartTag[] }) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
      <span className="text-sm text-text-muted">卦象标签</span>
      <div className="flex flex-col gap-1">
        {tags.map((tag) => (
          <div key={tag.id} className="flex flex-wrap items-baseline gap-2 text-sm">
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
              {tag.label}
            </span>
            <span className="text-text-muted">{tag.reason}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
