import type { ChartEvidence } from '@/engine/yongshen'

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

function Chips({ items, tone }: { items: readonly string[]; tone: 'support' | 'constraint' }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <span
          key={index}
          className={
            'rounded-full px-2 py-0.5 text-xs ' +
            (tone === 'support' ? 'bg-accent/10 text-accent' : 'bg-broken/15 text-broken')
          }
        >
          {item}
        </span>
      ))}
    </div>
  )
}

/** 用神取用与生克链：用神落在哪几爻、各有什么支持与反证，原神忌神在不在卦。 */
export function YongshenPanel({ evidence }: { evidence: ChartEvidence }) {
  const candidate = evidence.selectedCandidate
  if (!candidate) return null

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm text-text-muted">用神</span>
        <span className="font-medium">
          {candidate.label}
          {candidate.relative ? `（${candidate.relative}）` : ''}
        </span>
        <span className="text-xs text-text-muted">{candidate.sourceStatus}</span>
      </div>

      {candidate.references.length === 0 ? (
        <p className="text-sm text-text-muted">用神不上卦，需看伏神或另取用。</p>
      ) : (
        <div className="flex flex-col gap-2">
          {candidate.references.map((ref) => (
            <div key={ref.key} className="flex flex-col gap-1 rounded-md bg-surface px-3 py-2">
              <div className="flex flex-wrap items-baseline gap-2 text-sm">
                <span>
                  {positionLabels[ref.position - 1]} {ref.sixRelative}
                  {ref.branch}
                  {ref.wuxing}
                </span>
                <span className="text-xs text-text-muted">
                  {[
                    ref.isWorld && '世',
                    ref.isResponse && '应',
                    ref.isChanging && '动',
                    ref.isVoid && '空',
                    ref.source === '伏神' && '伏',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </span>
              </div>
              <Chips items={ref.support} tone="support" />
              <Chips items={ref.constraints} tone="constraint" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1 text-sm">
        {evidence.godChain
          .filter((item) => item.role !== '用神')
          .map((item) => (
            <div key={item.key} className="flex flex-wrap items-baseline gap-2">
              <span className="text-text-muted">{item.role}</span>
              <span>
                {item.wuxing}
                <span className="text-text-muted">（{item.relation}）</span>
              </span>
              <span className={item.status === '盘中有对应' ? 'text-text' : 'text-text-muted'}>
                {item.status}
                {item.references.length > 0 &&
                  `：${item.references.map((ref) => positionLabels[ref.position - 1]).join('、')}`}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}
