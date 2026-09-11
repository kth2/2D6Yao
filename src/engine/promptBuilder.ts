import type { ChartData } from './types'
import type { ChartTag } from './chartTags'
import type { RuleMatch } from './corpus'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

export interface PromptContext {
  questionType?: string
  question?: string
  tags?: readonly ChartTag[]
  matches?: readonly RuleMatch[]
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

  if (context.tags && context.tags.length > 0) {
    lines.push('', '卦象标签：')
    for (const tag of context.tags) lines.push(`${tag.label}：${tag.reason}`)
  }

  if (context.matches && context.matches.length > 0) {
    lines.push('', '命中条文（《六爻800例》）：')
    for (const match of context.matches) {
      lines.push(`[${match.rule.id}]（${match.rule.chapter_name}）${match.rule.text}`)
    }
    lines.push(
      '',
      '请只依据以上卦盘与命中条文组织断语，不要自行推演卦理；引用条文时标注编号，条文未涉及处说明依据不足。',
    )
  }

  return lines.join('\n')
}
