import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { providerPresets, normalizeBaseUrl, type ProviderKind } from '@/engine/aiProvider'
import { fetchModels, type CatalogModel } from '@/engine/modelCatalog'
import { useSettingsStore } from '@/store/settingsStore'

type Status = 'idle' | 'loading' | 'ready' | 'failed'

export function AiSettingsPanel() {
  const { ai, setAi } = useSettingsStore()
  const [models, setModels] = useState<CatalogModel[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [freeOnly, setFreeOnly] = useState(true)

  const preset = providerPresets.find((item) => item.id === ai.presetId)
  const freeCount = models.filter((model) => model.free).length
  const shown = freeOnly && freeCount > 0 ? models.filter((model) => model.free) : models

  const applyPreset = (presetId: string) => {
    const next = providerPresets.find((item) => item.id === presetId)
    if (!next) return
    setAi({
      presetId,
      kind: next.kind,
      baseUrl: next.baseUrl || ai.baseUrl,
      model: '',
    })
    setModels([])
    setStatus('idle')
    setError('')
  }

  const loadModels = async () => {
    setStatus('loading')
    setError('')
    try {
      const list = await fetchModels(ai)
      setModels(list)
      setStatus('ready')
      // 没选过模型时，默认挑第一个免费的，选不到就第一个。
      if (!ai.model && list.length > 0) {
        setAi({ model: (list.find((model) => model.free) ?? list[0]).id })
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setStatus('failed')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-text-muted">服务商</span>
          <select
            value={ai.presetId}
            onChange={(e) => applyPreset(e.target.value)}
            className="bg-transparent outline-none"
          >
            {providerPresets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          {preset?.keyUrl && (
            <a
              href={preset.keyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline"
            >
              去申请密钥 ↗
            </a>
          )}
        </label>
        {preset?.note && <p className="text-xs text-text-muted">{preset.note}</p>}

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-text-muted">接口地址</span>
          <input
            value={ai.baseUrl}
            onChange={(e) => setAi({ baseUrl: e.target.value })}
            placeholder="https://openrouter.ai/api/v1"
            className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1 outline-none"
          />
        </label>

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-text-muted">接口格式</span>
          <select
            value={ai.kind}
            onChange={(e) => setAi({ kind: e.target.value as ProviderKind })}
            className="bg-transparent outline-none"
          >
            <option value="openai">OpenAI 兼容</option>
            <option value="anthropic">Anthropic 原生</option>
          </select>
        </label>

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-text-muted">API Key</span>
          <input
            type="password"
            value={ai.apiKey}
            onChange={(e) => setAi({ apiKey: e.target.value })}
            placeholder="sk-..."
            className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1 outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => void loadModels()}
            disabled={status === 'loading' || !normalizeBaseUrl(ai.baseUrl)}
          >
            {status === 'loading' ? '正在读取…' : '测试连接并读取模型'}
          </Button>
          {status === 'ready' && (
            <span className="text-sm text-text-muted">
              共 {models.length} 个模型
              {freeCount > 0 ? `，其中 ${freeCount} 个免费` : '，未提供价格信息'}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-broken">读取失败：{error}</p>}
        {status === 'ready' && freeCount === 0 && (
          <p className="text-xs text-text-muted">
            该服务商的模型清单里没有价格字段，无法自动判断免费额度，请按自己账号的套餐选。
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-text-muted">模型</span>
          {freeCount > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
              />
              只看免费
            </label>
          )}
        </div>

        {models.length === 0 ? (
          <p className="text-sm text-text-muted">
            {ai.model ? `当前：${ai.model}` : '先读取模型清单，再从里面选。'}
          </p>
        ) : (
          <select
            value={ai.model}
            onChange={(e) => setAi({ model: e.target.value })}
            className="w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-sm outline-none"
          >
            <option value="">未选择</option>
            {shown.map((model) => (
              <option key={model.id} value={model.id}>
                {model.free ? '【免费】' : ''}
                {model.id}
                {model.contextLength ? ` · ${Math.round(model.contextLength / 1000)}K` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="text-xs text-text-muted">
        接口地址、密钥与模型只存在这台设备的浏览器里（localStorage），请求由浏览器直连服务商，不经任何中转。
        同一浏览器上的脚本能读到密钥，请只在自己的设备上填；不填也能用，去「解卦」复制提示词自己去问。
      </p>
    </div>
  )
}
