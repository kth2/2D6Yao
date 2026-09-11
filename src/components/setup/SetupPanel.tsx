import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useChart } from '@/hooks/useChart'
import {
  fromCoinThrows,
  fromHexagramName,
  fromManualYaos,
  fromTime,
  fromYarrow,
} from '@/engine/inputMethods'
import type { NumberCast } from '@/engine/numberCast'
import type { YaoValue } from '@/engine/yaoValue'
import { MethodTabs, type SetupMethod } from './MethodTabs'
import { TimeBasedInput } from './TimeBasedInput'
import { CoinToss } from './CoinToss'
import { NumberInput } from './NumberInput'
import { CharacterInput } from './CharacterInput'
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
  const [castReady, setCastReady] = useState(false)

  const handleCast = useCallback((cast: NumberCast | null) => {
    setCastReady(cast !== null)
    if (cast) setYaos(cast.yaos)
  }, [])

  const handleMethodChange = (next: SetupMethod) => {
    setMethod(next)
    setCastReady(false)
  }

  const canGenerate =
    method === 'coins'
      ? coinThrows.length === 6
      : method === 'number' || method === 'character'
        ? castReady
        : true

  const handleGenerate = () => {
    const generation =
      method === 'time'
        ? fromTime()
        : method === 'yarrow'
          ? fromYarrow()
          : method === 'coins'
            ? fromCoinThrows(coinThrows)
            : fromManualYaos(yaos)
    regenerate({ date, generation })
    onGenerated?.()
  }

  return (
    <div className="flex flex-col gap-4">
      <TimeBasedInput date={date} onChange={setDate} />
      <MethodTabs value={method} onChange={handleMethodChange} />

      {method === 'time' && (
        <p className="text-sm text-text-muted">将使用上方时间起卦，六爻由时辰数推算。</p>
      )}
      {method === 'yarrow' && (
        <p className="text-sm text-text-muted">
          大衍之数五十，其用四十有九；分二挂一揲四归奇，三变成一爻，十八变成卦。
        </p>
      )}
      {method === 'coins' && <CoinToss onChange={setCoinThrows} />}
      {method === 'number' && <NumberInput onCast={handleCast} />}
      {method === 'character' && <CharacterInput onCast={handleCast} />}
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
