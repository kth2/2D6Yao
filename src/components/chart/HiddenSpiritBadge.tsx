import type { LiuyaoHiddenSpirit } from '@/engine/types'

export function HiddenSpiritBadge({ spirit }: { spirit: LiuyaoHiddenSpirit }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface px-2 py-1 pl-8 text-xs text-text-muted">
      <span>
        伏 {spirit.sixRelative} {spirit.najiaDizhi}
        {spirit.wuxing}
        {spirit.isVoid ? '（空）' : ''}
      </span>
      {spirit.interactionEffect && <span>{spirit.interactionEffect}</span>}
    </div>
  )
}
