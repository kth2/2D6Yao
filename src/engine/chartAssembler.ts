import { computeLiuyao } from './liuyao'
import { computeCommonShensha } from './shensha'
import type { ChartData, ChartSettings } from './types'

/**
 * 唯一的卦盘计算入口：设置 → 完整卦盘。
 * UI 永远通过这一个函数重新生成卦盘，不直接调用底层引擎或修改已生成的结果。
 */
export function buildChart(settings: ChartSettings): ChartData {
  const liuyao = computeLiuyao(settings.date, settings.generation)
  const shensha = computeCommonShensha({
    yearGanZhi: liuyao.ganzhi.year,
    monthGanZhi: liuyao.ganzhi.month,
    dayGanZhi: liuyao.ganzhi.day,
    hourGanZhi: liuyao.ganzhi.hour,
  })
  return { settings, liuyao, shensha }
}
