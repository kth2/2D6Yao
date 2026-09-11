import { create } from 'zustand'
import { db, type SavedReading } from '@/db/db'

type NewReading = Omit<SavedReading, 'id' | 'createdAt'>

interface HistoryStore {
  saving: boolean
  save: (reading: NewReading) => Promise<number | undefined>
  update: (id: number, patch: Partial<SavedReading>) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  saving: false,
  save: async (reading) => {
    set({ saving: true })
    try {
      return await db.readings.add({ ...reading, createdAt: Date.now() })
    } finally {
      set({ saving: false })
    }
  },
  update: async (id, patch) => {
    set({ saving: true })
    try {
      await db.readings.update(id, patch)
    } finally {
      set({ saving: false })
    }
  },
  remove: async (id) => {
    await db.readings.delete(id)
  },
}))
