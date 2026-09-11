import { Button } from '@/components/ui/button'
import type { SavedReading } from '@/db/db'

export function HistoryEntryCard({
  reading,
  onOpen,
  onDelete,
}: {
  reading: SavedReading
  onOpen: () => void
  onDelete: () => void
}) {
  const { liuyao } = reading.chart
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
      <div className="flex flex-col">
        <span className="font-medium">{reading.label || liuyao.originalName}</span>
        <span className="text-text-muted">
          {liuyao.originalName}
          {liuyao.changedName ? ` → ${liuyao.changedName}` : ''} ·{' '}
          {new Date(reading.createdAt).toLocaleString('zh-CN')}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onOpen}>
          查看
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          删除
        </Button>
      </div>
    </div>
  )
}
