import type { ChartData } from './types'
import type { ChartTag } from './chartTags'
import type { CaseMatch, RuleMatch } from './corpus'
import type { ChartEvidence } from './yongshen'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

export interface PromptContext {
  questionType?: string
  question?: string
  evidence?: ChartEvidence
  tags?: readonly ChartTag[]
  matches?: readonly RuleMatch[]
  cases?: readonly CaseMatch[]
}

/** 把卦盘整理成结构化文本，供复制给 LLM 或人工断卦参考。 */
export function buildChartPrompt(chart: ChartData, context: PromptContext = {}): string {
  const { liuyao, shensha } = chart
  const lines: string[] = []

  if (context.question) lines.push(`问事：${context.question}`)
  if (context.questionType) lines.push(`事类：${context.questionType}`)
  lines.push(`本卦：${liuyao.originalName}（${liuyao.palace.name}宫）`)
  if (liuyao.changedName) lines.push(`变卦：${liuyao.changedName}`)
  lines.push(
    `四柱：${liuyao.ganzhi.year} ${liuyao.ganzhi.month} ${liuyao.ganzhi.day} ${liuyao.ganzhi.hour}`,
  )
  if (liuyao.voidBranches.length > 0) lines.push(`旬空：${liuyao.voidBranches.join('')}`)
  if (shensha.length > 0) {
    lines.push(`神煞：${shensha.map((s) => s.name).join('、')}`)
  }

  lines.push('', '逐爻：')
  for (const yao of [...liuyao.yaosDetail].reverse()) {
    const marks = [
      yao.isWorld && '世',
      yao.isResponse && '应',
      yao.isChanging && '动',
      yao.isVoid && '空',
      yao.isDayBreak && '日破',
      yao.isMonthBreak && '月破',
      yao.isHiddenMove && '暗动',
    ].filter(Boolean)
    let line = `${positionLabels[yao.position - 1]} ${yao.yaoType} ${yao.najiaDizhi}${yao.wuxing} ${yao.sixRelative} ${yao.sixGod}`
    if (marks.length > 0) line += `（${marks.join('、')}）`
    if (yao.changedYao) {
      line += ` → 变 ${yao.changedYao.dizhi}${yao.changedYao.wuxing} ${yao.changedYao.liuqin}`
    }
    lines.push(line)
  }

  if (liuyao.specialAdvice) lines.push('', liuyao.specialAdvice)

  const candidate = context.evidence?.selectedCandidate
  if (context.evidence && candidate) {
    lines.push(
      '',
      `用神：${candidate.label}${candidate.relative ? `（${candidate.relative}）` : ''} · ${candidate.sourceStatus}`,
    )
    for (const ref of candidate.references) {
      const marks = [
        ref.isWorld && '世',
        ref.isResponse && '应',
        ref.isChanging && '动',
        ref.isVoid && '空',
        ref.source === '伏神' && '伏',
      ].filter(Boolean)
      let line = `${positionLabels[ref.position - 1]} ${ref.sixRelative}${ref.branch}${ref.wuxing}`
      if (marks.length > 0) line += `（${marks.join('、')}）`
      if (ref.support.length > 0) line += ` 支持：${ref.support.join('、')}`
      if (ref.constraints.length > 0) line += ` 反证：${ref.constraints.join('、')}`
      lines.push(line)
    }
    if (candidate.references.length === 0) lines.push('用神不上卦。')
    for (const item of context.evidence.godChain) {
      if (item.role === '用神') continue
      const where =
        item.references.length > 0
          ? `：${item.references.map((ref) => positionLabels[ref.position - 1]).join('、')}`
          : ''
      lines.push(`${item.role} ${item.wuxing}（${item.relation}）${item.status}${where}`)
    }
  }

  if (context.tags && context.tags.length > 0) {
    lines.push('', '卦象标签：')
    for (const tag of context.tags) lines.push(`${tag.label}：${tag.reason}`)
  }

  if (context.matches && context.matches.length > 0) {
    lines.push('', '命中条文（《六爻800例》）：')
    for (const match of context.matches) {
      lines.push(`[${match.rule.id}]（${match.rule.chapter_name}）${match.rule.text}`)
    }
  }

  if (context.cases && context.cases.length > 0) {
    lines.push('', '相似书例（《六爻800例》）：')
    for (const { entry, sameHexagram } of context.cases) {
      const gua = entry.gua
        ? `${entry.gua.ben}${entry.gua.bian ? `→${entry.gua.bian}` : ''}${sameHexagram ? '（与本卦同）' : ''}`
        : '卦盘未识别'
      lines.push(
        `[书例#${entry.seq}]（${entry.chapter_name}·${gua}）问：${entry.question_raw}`,
        `断：${truncate(entry.analysis, 800)}`,
      )
      if (entry.note) lines.push(`注释：${entry.note}`)
      for (const item of entry.yingqi) lines.push(`应期 ${item.ganzhi}：${item.text}`)
    }
  }

  lines.push('', buildInstruction())

  return lines.join('\n')
}

/** 极少数书例正文长达数千字，截断以免一条书例挤掉其它证据。 */
function truncate(text: string, limit: number): string {
  return text.length <= limit ? text : `${text.slice(0, limit)}……（余文从略）`
}

/** 与 SCHEMA.md 的分工一致：盘面事实既定，推理归 LLM，但每步要带依据。 */
function buildInstruction(): string {
  return [
    '以上盘面事实由排盘引擎算出，是既定输入：纳甲、六亲、世应、旺衰、旬空、月破日破、伏神、动变一律照用，不要重算或改写。',
    '请在此基础上推理：先判用神旺衰与生克关系，再权衡命中条文（条文之间可能互相矛盾，需说明为何取此舍彼），然后给出结论与应期。',
    '每条结论标明依据：「依据 [条文编号]」「参照 [书例#编号]」或「推断」；证据不足处直说不足，不要凑。',
  ].join('\n')
}
