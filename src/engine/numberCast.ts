import { trigramsByIndex } from 'mingyu-core/divination/hexagram-data'
import { yaoValueFromParts, type YaoValue } from './yaoValue'

/**
 * 以数起卦（《梅花易数》）：数除八取卦、除六取动爻，除尽则取末位。
 * 先天八卦数 乾1 兑2 离3 震4 巽5 坎6 艮7 坤8，与 mingyu-core 的 trigramsByIndex 同序。
 */
export interface NumberCast {
  upperTrigram: string
  lowerTrigram: string
  /** 动爻爻位 1-6（初爻→上爻）。 */
  movingLine: number
  yaos: YaoValue[]
}

function toTrigramNumber(value: number): number {
  return (((Math.trunc(value) - 1) % 8) + 8) % 8 + 1
}

function toMovingLine(value: number): number {
  return (((Math.trunc(value) - 1) % 6) + 6) % 6 + 1
}

export interface StrokeCast extends NumberCast {
  upperStrokes: number
  lowerStrokes: number
  totalStrokes: number
}

export function castFromNumbers(
  upperNumber: number,
  lowerNumber: number,
  movingNumber: number,
): NumberCast {
  const upper = trigramsByIndex[toTrigramNumber(upperNumber)]
  const lower = trigramsByIndex[toTrigramNumber(lowerNumber)]
  const movingLine = toMovingLine(movingNumber)
  const yaos = [...lower.lines, ...upper.lines].map((line, index) =>
    yaoValueFromParts(line === 1, index + 1 === movingLine),
  )
  return { upperTrigram: upper.name, lowerTrigram: lower.name, movingLine, yaos }
}

/** 以字画起卦：字数均分，少者为上卦、多者为下卦，总笔画取动爻；至少两字。 */
export function castFromStrokes(strokes: readonly number[]): StrokeCast | null {
  if (strokes.length < 2) return null
  const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0)
  const upperCount = Math.floor(strokes.length / 2)
  const upperStrokes = sum(strokes.slice(0, upperCount))
  const lowerStrokes = sum(strokes.slice(upperCount))
  const totalStrokes = upperStrokes + lowerStrokes
  return {
    ...castFromNumbers(upperStrokes, lowerStrokes, totalStrokes),
    upperStrokes,
    lowerStrokes,
    totalStrokes,
  }
}
