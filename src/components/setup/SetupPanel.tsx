import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useChart } from '@/hooks/useChart'
import { fromCoinThrows, fromManualYaos, fromTime, fromYarrow } from '@/engine/inputMethods'
import { getHexagramByName } from '@/engine/hexagramTable'
import type { NumberCast } from '@/engine/numberCast'
import { applyLines, type YaoValue } from '@/engine/yaoValue'
import { MethodTabs, type SetupMethod } from './MethodTabs'
import { TimeBasedInput } from './TimeBasedInput'
import { CoinToss } from './CoinToss'
import { NumberInput } from './NumberInput'
import { CharacterInput } from './CharacterInput'
import { ManualLineInput } from './ManualLineInput'
import { HexagramPicker } from './HexagramPicker'
import { TrigramPicker } from './TrigramPicker'
import { HexagramPreview } from './HexagramPreview'
import { MovingLinesSelector } from './MovingLinesSelector'

const defaultYaos: YaoValue[] = [7, 7, 7, 7, 7, 7]

export function SetupPanel({ onGenerated }: { onGenerated?: () => void }) {
  const { regenerate } = useChart()
  const [method, setMethod] = useState<SetupMethod>('pick')
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
      {method === 'manual' && (
        <div className="flex flex-col gap-3">
          <ManualLineInput yaos={yaos} onChange={setYaos} />
          <HexagramPreview yaos={yaos} />
        </div>
      )}
      {method === 'pick' && (
        <div className="flex flex-col gap-3">
          <TrigramPicker yaos={yaos} onChange={setYaos} />
          <HexagramPicker
            onSelect={(name) => {
              const hexagram = getHexagramByName(name)
              if (hexagram) setYaos(applyLines(yaos, hexagram.lines))
            }}
          />
          <MovingLinesSelector yaos={yaos} onChange={setYaos} />
          <HexagramPreview yaos={yaos} />
        </div>
      )}

      <Button onClick={handleGenerate} disabled={!canGenerate}>
        生成卦盘
      </Button>
    </div>
  )
}
