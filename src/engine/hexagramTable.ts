import { hexagramsData, trigramsByIndex } from 'mingyu-core/divination/hexagram-data'

/** 初爻→上爻顺序的六爻阴阳数组，1=阳、0=阴。 */
export type HexagramLineArray = readonly (0 | 1)[]

export interface HexagramLines {
  id: number
  name: string
  lines: HexagramLineArray
}

export interface Trigram {
  name: string
  symbol: string
  /** 卦象所主之物：天泽火雷风水山地。 */
  nature: string
  lines: HexagramLineArray
}

const trigramsByName = new Map(Object.values(trigramsByIndex).map((t) => [t.name, t]))

/** 先天八卦次序：乾一兑二离三震四巽五坎六艮七坤八。 */
const trigramList: Trigram[] = Object.keys(trigramsByIndex)
  .map(Number)
  .sort((a, b) => a - b)
  .map((index) => {
    const trigram = trigramsByIndex[index]
    return {
      name: trigram.name,
      symbol: trigram.symbol,
      nature: trigram.nature,
      lines: trigram.lines as HexagramLineArray,
    }
  })

function toLines(upperName: string, lowerName: string): HexagramLineArray {
  const lower = trigramsByName.get(lowerName)
  const upper = trigramsByName.get(upperName)
  if (!lower || !upper) {
    throw new Error(`未知卦象：上卦「${upperName}」或下卦「${lowerName}」`)
  }
  return [...lower.lines, ...upper.lines] as HexagramLineArray
}

export function getHexagramByName(name: string): HexagramLines | null {
  const entry = hexagramsData.find((h) => h.name === name)
  if (!entry) return null
  return { id: entry.id, name: entry.name, lines: toLines(entry.upper, entry.lower) }
}

export function getHexagramByLines(lines: HexagramLineArray): HexagramLines | null {
  const key = lines.join('')
  for (const entry of hexagramsData) {
    const entryLines = toLines(entry.upper, entry.lower)
    if (entryLines.join('') === key) {
      return { id: entry.id, name: entry.name, lines: entryLines }
    }
  }
  return null
}

export function listHexagramNames(): string[] {
  return hexagramsData.map((h) => h.name)
}

export function listTrigrams(): Trigram[] {
  return trigramList
}

export function getTrigramByLines(lines: HexagramLineArray): Trigram | null {
  const key = lines.join('')
  return trigramList.find((trigram) => trigram.lines.join('') === key) ?? null
}
