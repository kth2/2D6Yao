import { useState } from 'react'
import { useChart } from '@/hooks/useChart'
import { HexagramColumn } from './HexagramColumn'
import { ShenshaList } from './ShenshaList'
import { RelationsPanel } from './RelationsPanel'
import { VoidBreakIndicators } from './VoidBreakIndicators'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

type Layout = 'side-by-side' | 'tabbed'

export function ChartView() {
  const { chart } = useChart()
  const [layout, setLayout] = useState<Layout>('side-by-side')

  if (!chart) {
    return <p className="text-sm text-text-muted">还没有卦盘，先去「起卦」生成一个。</p>
  }

  const { liuyao, shensha } = chart
  const hasChanged = Boolean(liuyao.changedName)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <ShenshaList shensha={shensha} />
        {hasChanged && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLayout(layout === 'side-by-side' ? 'tabbed' : 'side-by-side')}
          >
            {layout === 'side-by-side' ? '切换为标签视图' : '切换为并排视图'}
          </Button>
        )}
      </div>

      <VoidBreakIndicators liuyao={liuyao} />

      {!hasChanged || layout === 'side-by-side' ? (
        <div className="flex flex-col gap-4 sm:flex-row">
          <HexagramColumn liuyao={liuyao} variant="original" />
          {hasChanged && <HexagramColumn liuyao={liuyao} variant="changed" />}
        </div>
      ) : (
        <Tabs defaultValue="original">
          <TabsList>
            <TabsTrigger value="original">本卦</TabsTrigger>
            <TabsTrigger value="changed">变卦</TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="pt-3">
            <HexagramColumn liuyao={liuyao} variant="original" />
          </TabsContent>
          <TabsContent value="changed" className="pt-3">
            <HexagramColumn liuyao={liuyao} variant="changed" />
          </TabsContent>
        </Tabs>
      )}

      <RelationsPanel liuyao={liuyao} />
    </div>
  )
}
