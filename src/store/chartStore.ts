import { create } from 'zustand'
import { buildChart } from '@/engine/chartAssembler'
import type { ChartData, ChartSettings } from '@/engine/types'

interface ChartStore {
  chart: ChartData | null
  /** 设置 → 重新计算完整卦盘，是生成新卦盘的唯一途径。 */
  regenerate: (settings: ChartSettings) => void
  /** 直接载入一个已保存的卦盘（历史记录），不重新计算。 */
  load: (chart: ChartData) => void
  clear: () => void
}

export const useChartStore = create<ChartStore>((set) => ({
  chart: null,
  regenerate: (settings) => set({ chart: buildChart(settings) }),
  load: (chart) => set({ chart }),
  clear: () => set({ chart: null }),
}))
