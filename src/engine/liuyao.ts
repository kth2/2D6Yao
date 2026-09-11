import { generateLiuyao } from 'mingyu-core/divination/liuyao'
import type { LiuyaoGenerationOptions } from 'mingyu-core/divination/liuyao'

export type { LiuyaoGenerationMethod, LiuyaoGenerationOptions } from 'mingyu-core/divination/liuyao'

/** mingyu-core 六爻排盘的真实返回结构（其 .d.ts 未导出具名类型，改用 ReturnType 锁定）。 */
export type LiuyaoChart = ReturnType<typeof generateLiuyao>

export function computeLiuyao(date?: Date, options?: LiuyaoGenerationOptions): LiuyaoChart {
  return generateLiuyao(date, options)
}
