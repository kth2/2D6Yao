import type { LiuyaoChart } from '@/engine/liuyao'
import { ChartHeader } from './ChartHeader'
import { FourPillarsBar } from './FourPillarsBar'
import { YaoRow } from './YaoRow'
import { HiddenSpiritBadge } from './HiddenSpiritBadge'

export function HexagramColumn({
  liuyao,
  variant,
}: {
  liuyao: LiuyaoChart
  variant: 'original' | 'changed'
}) {
  const name = variant === 'original' ? liuyao.originalName : (liuyao.changedName ?? liuyao.originalName)
  const shiYao = liuyao.yaosDetail.find((y) => y.isWorld)
  const yingYao = liuyao.yaosDetail.find((y) => y.isResponse)

  return (
    <div className="flex flex-1 flex-col gap-2">
      <ChartHeader
        name={name}
        gong={liuyao.palace.name}
        gongWuxing={liuyao.palace.wuxing}
        palaceStage={liuyao.palaceStage}
        shiPosition={shiYao?.position ?? 0}
        yingPosition={yingYao?.position ?? 0}
        specialPattern={variant === 'original' ? liuyao.specialPattern : undefined}
      />
      <FourPillarsBar ganzhi={liuyao.ganzhi} voidBranches={liuyao.voidBranches} />
      <div className="flex flex-col-reverse gap-1">
        {[...liuyao.yaosDetail].reverse().map((yao) => {
          const showChanged = variant === 'changed' && yao.isChanging && yao.changedYao
          const hidden = liuyao.hiddenSpirits?.find((s) => s.underYao.position === yao.position)
          return (
            <div key={yao.position} className="flex flex-col gap-1">
              <YaoRow
                yao={yao}
                dizhi={showChanged ? yao.changedYao!.dizhi : yao.najiaDizhi}
                wuxing={showChanged ? yao.changedYao!.wuxing : yao.wuxing}
                sixRelative={showChanged ? yao.changedYao!.liuqin : yao.sixRelative}
                isVoid={showChanged ? yao.changedYao!.isVoid : yao.isVoid}
              />
              {variant === 'original' && hidden && <HiddenSpiritBadge spirit={hidden} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
