import Dexie, { type EntityTable } from 'dexie'
import type { ChartData } from '@/engine/types'

export interface SavedReading {
  id?: number
  createdAt: number
  label: string
  chart: ChartData
}

export const db = new Dexie('liuyao') as Dexie & {
  readings: EntityTable<SavedReading, 'id'>
}

db.version(1).stores({
  readings: '++id, createdAt',
})
