import { useEffect, useMemo, useState } from 'react'
import { useChart } from '@/hooks/useChart'
import { extractChartTags } from '@/engine/chartTags'
import { listChapters, loadRules, matchRules, type CorpusRule } from '@/engine/corpus'
import { Button } from '@/components/ui/button'
import { ChartTagList } from './ChartTagList'
import { RuleMatches } from './RuleMatches'
import { PromptPreview } from './PromptPreview'

const pageSize = 8

export function InterpretationPanel() {
  const { chart } = useChart()
  const [rules, setRules] = useState<CorpusRule[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [chapter, setChapter] = useState('')
  const [visible, setVisible] = useState(pageSize)

  useEffect(() => {
    let cancelled = false
    loadRules().then(
      (loaded) => {
        if (!cancelled) setRules(loaded)
      },
      () => {
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const tags = useMemo(() => (chart ? extractChartTags(chart.liuyao) : []), [chart])
  const matches = useMemo(
    () => (rules ? matchRules(rules, tags, chapter || undefined) : []),
    [rules, tags, chapter],
  )
  const shown = matches.slice(0, visible)

  if (!chart) {
    return <p className="text-sm text-text-muted">还没有卦盘，先去「起卦」生成一个。</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
        <span className="shrink-0 text-text-muted">事类</span>
        <select
          value={chapter}
          onChange={(e) => {
            setChapter(e.target.value)
            setVisible(pageSize)
          }}
          className="bg-transparent outline-none"
        >
          <option value="">全部</option>
          {rules &&
            listChapters(rules).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
        </select>
        <span className="ml-auto text-xs text-text-muted">
          {failed ? '条文库载入失败' : rules ? `命中 ${matches.length} 条` : '正在载入条文库…'}
        </span>
      </label>

      <ChartTagList tags={tags} />

      {rules && <RuleMatches matches={shown} tags={tags} />}
      {matches.length > shown.length && (
        <Button variant="outline" onClick={() => setVisible(visible + pageSize)}>
          再显示 {Math.min(pageSize, matches.length - shown.length)} 条
        </Button>
      )}

      <PromptPreview context={{ questionType: chapter || undefined, tags, matches: shown }} />
    </div>
  )
}
