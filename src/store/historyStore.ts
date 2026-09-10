import { create } from 'zustand'
import { db } from '@/db/db'
import type { ChartData } from '@/engine/types'

interface HistoryStore {
  saving: boolean
  save: (chart: ChartData, label: string) => Promise<number | undefined>
  remove: (id: number) => Promise<void>
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  saving: false,
  save: async (chart, label) => {
    set({ saving: true })
    try {
      return await db.readings.add({ chart, label, createdAt: Date.now() })
    } finally {
      set({ saving: false })
    }
  },
  remove: async (id) => {
    await db.readings.delete(id)
  },
}))
