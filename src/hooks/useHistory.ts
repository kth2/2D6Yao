import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { useHistoryStore } from '@/store/historyStore'

export function useHistory() {
  const readings = useLiveQuery(() => db.readings.orderBy('createdAt').reverse().toArray(), [])
  const { save, update, remove, saving } = useHistoryStore()
  return { readings: readings ?? [], save, update, remove, saving }
}
