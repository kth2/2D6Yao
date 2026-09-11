import type { LiuyaoGenerationOptions } from './liuyao'

/** 手动逐爻输入：初爻→上爻，每爻 6/7/8/9。 */
export function fromManualYaos(yaos: readonly number[]): LiuyaoGenerationOptions {
  return { method: 'manual', yaos }
}

/** 投币模拟：初爻→上爻，每爻三枚币的正反面记录。 */
export function fromCoinThrows(
  coinThrows: NonNullable<LiuyaoGenerationOptions['coinThrows']>,
): LiuyaoGenerationOptions {
  return { method: 'coins', coinThrows }
}

/** 按时间起卦，不传日期则使用当前时间。 */
export function fromTime(): LiuyaoGenerationOptions {
  return { method: 'time' }
}

/** 蓍草十八变（大衍之数四十九策），分堆由引擎完成。 */
export function fromYarrow(): LiuyaoGenerationOptions {
  return { method: 'yarrow' }
}
