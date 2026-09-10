import type { ChartData } from './types'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

/** 把卦盘整理成结构化文本，供复制给 LLM 或人工断卦参考。 */
export function buildChartPrompt(chart: ChartData): string {
  const { liuyao, shensha } = chart
  const lines: string[] = []

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

  return lines.join('\n')
}
