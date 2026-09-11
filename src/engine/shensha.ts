import { computeShensha, listShensha } from 'mingyu-core/shensha'
import type { ShenshaContext, ShenshaResult } from 'mingyu-core/shensha'

export type { ShenshaContext, ShenshaResult } from 'mingyu-core/shensha'

/** 通用命理神煞（驿马、桃花等，随 mingyu-core 版本增补，不在此硬编码名单）。 */
export function computeCommonShensha(ctx: ShenshaContext): ShenshaResult[] {
  const ids = listShensha('common').map((def) => def.id)
  return computeShensha(ids, ctx)
}
