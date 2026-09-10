import { hexagramsData, trigramsByIndex } from 'mingyu-core/divination/hexagram-data'

/** 初爻→上爻顺序的六爻阴阳数组，1=阳、0=阴。 */
export type HexagramLineArray = readonly (0 | 1)[]

export interface HexagramLines {
  id: number
  name: string
  lines: HexagramLineArray
}

const trigramsByName = new Map(Object.values(trigramsByIndex).map((t) => [t.name, t]))

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

export function getHexagramById(id: number): HexagramLines | null {
  const entry = hexagramsData.find((h) => h.id === id)
  if (!entry) return null
  return { id: entry.id, name: entry.name, lines: toLines(entry.upper, entry.lower) }
}

export function listHexagramNames(): string[] {
  return hexagramsData.map((h) => h.name)
}

/** 阳→少阳(7)、阴→少阴(8)，即静爻起点；动爻由 UI 再翻到 9/6。 */
export function linesToStaticYaoArray(lines: HexagramLineArray): number[] {
  return lines.map((line) => (line === 1 ? 7 : 8))
}
