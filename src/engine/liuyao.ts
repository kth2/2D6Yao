import { generateLiuyao } from 'mingyu-core/divination/liuyao'
import type { LiuyaoGenerationOptions } from 'mingyu-core/divination/liuyao'

export type { LiuyaoGenerationMethod, LiuyaoGenerationOptions } from 'mingyu-core/divination/liuyao'

/** mingyu-core 六爻排盘的真实返回结构（其 .d.ts 未导出具名类型，改用 ReturnType 锁定）。 */
export type LiuyaoChart = ReturnType<typeof generateLiuyao>

export function computeLiuyao(date?: Date, options?: LiuyaoGenerationOptions): LiuyaoChart {
  return generateLiuyao(date, options)
}

/**
 * 是否真有变卦。静卦时 mingyu-core 仍会把 changedName 填成本卦名，
 * 不能拿 changedName 有没有值来判断，要看有没有动爻。
 */
export function hasChangedHexagram(liuyao: LiuyaoChart): boolean {
  return liuyao.yaosDetail.some((yao) => yao.isChanging)
}
