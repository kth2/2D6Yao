import { useEffect, useMemo, useState } from 'react'
import { useChart } from '@/hooks/useChart'
import { extractChartTags, extractEvidenceTags } from '@/engine/chartTags'
import {
  listChapters,
  loadCases,
  loadRules,
  matchCases,
  matchRules,
  type CorpusCase,
  type CorpusRule,
} from '@/engine/corpus'
import { analyzeEvidence, sixRelatives, type SixRelative } from '@/engine/yongshen'
import { Button } from '@/components/ui/button'
import { YongshenPanel } from './YongshenPanel'
import { ChartTagList } from './ChartTagList'
import { RuleMatches } from './RuleMatches'
import { CaseMatches } from './CaseMatches'
import { PromptPreview } from './PromptPreview'

const pageSize = 8
const caseCount = 3

export function InterpretationPanel() {
  const { chart } = useChart()
  const [rules, setRules] = useState<CorpusRule[] | null>(null)
  const [cases, setCases] = useState<CorpusCase[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [chapter, setChapter] = useState('')
  const [relative, setRelative] = useState<SixRelative | ''>('')
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
    loadCases().then(
      (loaded) => {
        if (!cancelled) setCases(loaded)
      },
      () => {
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const evidence = useMemo(
    () =>
      chart
        ? analyzeEvidence(chart.liuyao, {
            chapter: chapter || undefined,
            relative: relative || undefined,
          })
        : null,
    [chart, chapter, relative],
  )
  const tags = useMemo(
    () =>
      chart && evidence
        ? [...extractChartTags(chart.liuyao), ...extractEvidenceTags(evidence)]
        : [],
    [chart, evidence],
  )
  const matches = useMemo(
    () => (rules ? matchRules(rules, tags, chapter || undefined) : []),
    [rules, tags, chapter],
  )
  const shown = matches.slice(0, visible)
  const caseMatches = useMemo(
    () =>
      cases && chart
        ? matchCases(cases, tags, chart.liuyao.originalName, chapter || undefined).slice(
            0,
            caseCount,
          )
        : [],
    [cases, chart, tags, chapter],
  )

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
        <span className="shrink-0 text-text-muted">用神</span>
        <select
          value={relative}
          onChange={(e) => {
            setRelative(e.target.value as SixRelative | '')
            setVisible(pageSize)
          }}
          className="bg-transparent outline-none"
        >
          <option value="">按事类自动</option>
          {sixRelatives.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-text-muted">
          {failed ? '条文库载入失败' : rules ? `命中 ${matches.length} 条` : '正在载入条文库…'}
        </span>
      </label>

      {evidence && <YongshenPanel evidence={evidence} />}
      <ChartTagList tags={tags} />

      {rules && <RuleMatches matches={shown} tags={tags} />}
      {matches.length > shown.length && (
        <Button variant="outline" onClick={() => setVisible(visible + pageSize)}>
          再显示 {Math.min(pageSize, matches.length - shown.length)} 条
        </Button>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-muted">
          相似书例{cases ? '' : '（正在载入书例库…）'}
        </span>
        {cases && <CaseMatches matches={caseMatches} tags={tags} />}
      </div>

      <PromptPreview
        context={{
          questionType: chapter || undefined,
          evidence: evidence ?? undefined,
          tags,
          matches: shown,
          cases: caseMatches,
        }}
      />
    </div>
  )
}
