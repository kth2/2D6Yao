import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useChart } from '@/hooks/useChart'
import { fromCoinThrows, fromHexagramName, fromManualYaos, fromTime } from '@/engine/inputMethods'
import type { YaoValue } from '@/engine/yaoValue'
import { MethodTabs, type SetupMethod } from './MethodTabs'
import { TimeBasedInput } from './TimeBasedInput'
import { CoinToss } from './CoinToss'
import { ManualLineInput } from './ManualLineInput'
import { HexagramPicker } from './HexagramPicker'
import { MovingLinesSelector } from './MovingLinesSelector'

const defaultYaos: YaoValue[] = [7, 7, 7, 7, 7, 7]

export function SetupPanel({ onGenerated }: { onGenerated?: () => void }) {
  const { regenerate } = useChart()
  const [method, setMethod] = useState<SetupMethod>('time')
  const [date, setDate] = useState(() => new Date())
  const [yaos, setYaos] = useState<YaoValue[]>(defaultYaos)
  const [coinThrows, setCoinThrows] = useState<Parameters<typeof fromCoinThrows>[0]>([])

  const canGenerate = method !== 'coins' || coinThrows.length === 6

  const handleGenerate = () => {
    const generation =
      method === 'time'
        ? fromTime()
        : method === 'coins'
          ? fromCoinThrows(coinThrows)
          : fromManualYaos(yaos)
    regenerate({ date, generation })
    onGenerated?.()
  }

  return (
    <div className="flex flex-col gap-4">
      <TimeBasedInput date={date} onChange={setDate} />
      <MethodTabs value={method} onChange={setMethod} />

      {method === 'time' && (
        <p className="text-sm text-text-muted">将使用上方时间起卦，六爻由时辰数推算。</p>
      )}
      {method === 'coins' && <CoinToss onChange={setCoinThrows} />}
      {method === 'manual' && <ManualLineInput yaos={yaos} onChange={setYaos} />}
      {method === 'pick' && (
        <div className="flex flex-col gap-3">
          <HexagramPicker
            onSelect={(name) => {
              const options = fromHexagramName(name)
              if (options?.method === 'manual') setYaos(options.yaos as YaoValue[])
            }}
          />
          <MovingLinesSelector yaos={yaos} onChange={setYaos} />
        </div>
      )}

      <Button onClick={handleGenerate} disabled={!canGenerate}>
        生成卦盘
      </Button>
    </div>
  )
}
