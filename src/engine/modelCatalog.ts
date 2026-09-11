import { normalizeBaseUrl, type AiConfig } from './aiProvider'

export interface CatalogModel {
  id: string
  label: string
  /** 判定为免费：价格明确为 0，或 id 带 :free 后缀。 */
  free: boolean
  /** 服务商是否给出了价格；没给就无法判断免费与否。 */
  priced: boolean
  contextLength?: number
}

interface RawModel {
  id?: string
  name?: string
  display_name?: string
  context_length?: number
  pricing?: { prompt?: string | number; completion?: string | number }
}

function isZero(value: string | number | undefined): boolean {
  if (value === undefined) return false
  return Number(value) === 0
}

function toCatalogModel(raw: RawModel): CatalogModel | null {
  const id = raw.id
  if (!id) return null
  const priced = raw.pricing?.prompt !== undefined
  const free = id.endsWith(':free') || (priced && isZero(raw.pricing?.prompt) && isZero(raw.pricing?.completion))
  return {
    id,
    label: raw.name ?? raw.display_name ?? id,
    free,
    priced,
    contextLength: raw.context_length,
  }
}

/**
 * 拉取服务商的模型清单，让用户从真实可用的模型里选，而不是手打型号。
 * OpenAI 兼容接口是 GET {base}/models；Anthropic 是 GET {base}/v1/models。
 */
export async function fetchModels(config: AiConfig, signal?: AbortSignal): Promise<CatalogModel[]> {
  const base = normalizeBaseUrl(config.baseUrl)
  if (!base) throw new Error('请先填写接口地址')

  const url = config.kind === 'anthropic' ? `${base}/v1/models?limit=100` : `${base}/models`
  const headers: Record<string, string> =
    config.kind === 'anthropic'
      ? {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        }
      : { Authorization: `Bearer ${config.apiKey}` }

  const response = await fetch(url, { headers, signal })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`${response.status} ${response.statusText}${detail ? ` — ${detail.slice(0, 200)}` : ''}`)
  }

  const payload: unknown = await response.json()
  const list = (payload as { data?: RawModel[]; models?: RawModel[] }).data ??
    (payload as { models?: RawModel[] }).models ??
    []

  const models = list.map(toCatalogModel).filter((model): model is CatalogModel => model !== null)
  // 免费的排前面，省得用户在几百个型号里翻。
  return models.sort((a, b) => Number(b.free) - Number(a.free) || a.id.localeCompare(b.id))
}
