import { useHistory } from '@/hooks/useHistory'
import { useChart } from '@/hooks/useChart'
import { HistoryEntryCard } from './HistoryEntryCard'

export function HistoryList() {
  const { readings, remove } = useHistory()
  const { load } = useChart()

  if (readings.length === 0) {
    return <p className="text-sm text-text-muted">还没有保存过卦盘。</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {readings.map((reading) => (
        <HistoryEntryCard
          key={reading.id}
          reading={reading}
          onOpen={() => load(reading.chart)}
          onDelete={() => reading.id !== undefined && remove(reading.id)}
        />
      ))}
    </div>
  )
}
