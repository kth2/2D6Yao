import Dexie, { type EntityTable } from 'dexie'
import type { ChartData } from '@/engine/types'
import type { ReadingExchange } from '@/engine/llm'

export type OutcomeStatus = 'accurate' | 'partial' | 'wrong'

export const outcomeLabels: Record<OutcomeStatus, string> = {
  accurate: '应验',
  partial: '部分应验',
  wrong: '未应验',
}

/** 事后回填的实际结果，用来统计准确率。 */
export interface ReadingOutcome {
  status: OutcomeStatus
  note: string
  recordedAt: number
}

export interface SavedReading {
  id?: number
  createdAt: number
  /** 所问何事。旧记录存在 label 里，读取时回退。 */
  question?: string
  label?: string
  chapter?: string
  chart: ChartData
  /** AI 断卦与追问，存下来才能回头复盘。 */
  exchanges?: ReadingExchange[]
  outcome?: ReadingOutcome
}

export function readingTitle(reading: SavedReading): string {
  return reading.question || reading.label || reading.chart.liuyao.originalName
}

export const db = new Dexie('liuyao') as Dexie & {
  readings: EntityTable<SavedReading, 'id'>
}

db.version(1).stores({
  readings: '++id, createdAt',
})
