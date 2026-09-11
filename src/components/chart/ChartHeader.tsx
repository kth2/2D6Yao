export function ChartHeader({
  name,
  gong,
  gongWuxing,
  palaceStage,
  shiPosition,
  yingPosition,
  specialPattern,
}: {
  name: string
  gong: string
  gongWuxing: string
  palaceStage?: string
  shiPosition: number
  yingPosition: number
  specialPattern?: string
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-medium">{name}</h2>
        <span className="text-sm text-text-muted">
          {gong}宫（{gongWuxing}）{palaceStage ? ` · ${palaceStage}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span>世 {shiPosition}</span>
        <span>应 {yingPosition}</span>
        {specialPattern && <span className="text-accent">{specialPattern}</span>}
      </div>
    </div>
  )
}
