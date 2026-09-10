import type { LiuyaoGenerationOptions } from './liuyao'
import { getHexagramById, getHexagramByName, linesToStaticYaoArray } from './hexagramTable'

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

/** 直接选定本卦（按卦名），起始为全静爻，动爻由用户在设置里再勾选。 */
export function fromHexagramName(name: string): LiuyaoGenerationOptions | null {
  const hexagram = getHexagramByName(name)
  if (!hexagram) return null
  return { method: 'manual', yaos: linesToStaticYaoArray(hexagram.lines) }
}

/** 直接选定本卦（按 1-64 编号）。 */
export function fromHexagramId(id: number): LiuyaoGenerationOptions | null {
  const hexagram = getHexagramById(id)
  if (!hexagram) return null
  return { method: 'manual', yaos: linesToStaticYaoArray(hexagram.lines) }
}
