import type { LiuyaoChart, LiuyaoGenerationOptions } from './liuyao'
import type { ShenshaResult } from './shensha'

export type {
  BaseGanZhi,
  LiuyaoData,
  LiuyaoFanFuRelations,
  LiuyaoHexagramRelations,
  LiuyaoHiddenSpirit,
  LiuyaoPalaceStage,
  LiuyaoYaoDetail,
  SixGod,
} from 'mingyu-core/types'

export interface ChartSettings {
  /** 起卦时使用的时间；不传则用当前时间。 */
  date?: Date
  /** 起卦方式与对应参数，见 engine/inputMethods.ts。 */
  generation: LiuyaoGenerationOptions
}

/** 单次起卦的完整结果：mingyu-core 排盘 + 神煞，供 UI 直接渲染。 */
export interface ChartData {
  settings: ChartSettings
  liuyao: LiuyaoChart
  shensha: ShenshaResult[]
}
