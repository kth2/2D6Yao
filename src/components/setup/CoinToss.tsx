import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Coin = 2 | 3
type Throw = { coins: [Coin, Coin, Coin]; total: 6 | 7 | 8 | 9 }

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

function tossOnce(): Throw {
  const coins = [randomCoin(), randomCoin(), randomCoin()] as [Coin, Coin, Coin]
  const total = (coins[0] + coins[1] + coins[2]) as Throw['total']
  return { coins, total }
}

function randomCoin(): Coin {
  return Math.random() < 0.5 ? 2 : 3
}

/** 三枚币逐爻摇卦：初爻→上爻，每爻投掷一次；2=背(阴)、3=字(阳)。 */
export function CoinToss({ onChange }: { onChange: (throws: Throw[]) => void }) {
  const [throws, setThrows] = useState<Throw[]>([])

  const tossNext = () => {
    if (throws.length >= 6) return
    const next = [...throws, tossOnce()]
    setThrows(next)
    onChange(next)
  }

  const reset = () => {
    setThrows([])
    onChange([])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col-reverse gap-1">
        {throws.map((t, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
          >
            <span className="text-text-muted">{positionLabels[index]}</span>
            <span>{t.coins.map((c) => (c === 3 ? '字' : '背')).join(' ')}</span>
            <span className="font-medium">{t.total}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={tossNext} disabled={throws.length >= 6}>
          投掷第 {Math.min(throws.length + 1, 6)} 爻
        </Button>
        <Button variant="outline" onClick={reset} disabled={throws.length === 0}>
          重摇
        </Button>
      </div>
    </div>
  )
}
