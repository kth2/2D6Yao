import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useHistory } from '@/hooks/useHistory'
import type { ChartData } from '@/engine/types'

export function SaveChartBar({ chart }: { chart: ChartData }) {
  const { save, saving } = useHistory()
  const [label, setLabel] = useState('')
  const [savedChart, setSavedChart] = useState<ChartData | null>(null)

  // buildChart 每次返回新对象，引用相同即说明这一盘已经存过。
  const saved = savedChart === chart

  const handleSave = async () => {
    if (saved || saving) return
    await save(chart, label.trim())
    setSavedChart(chart)
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleSave()
        }}
        placeholder="问事，例如：问今年财运"
        className="w-full bg-transparent outline-none"
      />
      <Button size="sm" disabled={saved || saving} onClick={() => void handleSave()}>
        {saved ? '已保存' : saving ? '保存中…' : '保存到历史'}
      </Button>
    </div>
  )
}
