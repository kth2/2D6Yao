import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { models, streamReading, type ModelId } from '@/engine/llm'
import { useSettingsStore } from '@/store/settingsStore'

type Status = 'idle' | 'running' | 'done' | 'failed'

export function AIReadingPanel({ prompt }: { prompt: string }) {
  const { apiKey, model, setApiKey, setModel } = useSettingsStore()
  const [thinking, setThinking] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [showThinking, setShowThinking] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const run = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setThinking('')
    setText('')
    setError('')
    setStatus('running')

    try {
      await streamReading(
        { apiKey, model, prompt, signal: controller.signal },
        {
          onThinking: (delta) => setThinking((current) => current + delta),
          onText: (delta) => setText((current) => current + delta),
        },
      )
      setStatus('done')
    } catch (cause) {
      if (controller.signal.aborted) {
        setStatus('idle')
        return
      }
      setError(cause instanceof Error ? cause.message : String(cause))
      setStatus('failed')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="shrink-0 text-text-muted">API Key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1 outline-none"
        />
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as ModelId)}
          className="bg-transparent outline-none"
        >
          {models.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-text-muted">
        密钥只存在本机浏览器（localStorage），直连 Anthropic，不经过任何中转；同一浏览器上的脚本可读到它，请只在自己的设备上填。
      </p>

      <div className="flex gap-2">
        <Button onClick={() => void run()} disabled={!apiKey || status === 'running'}>
          {status === 'running' ? '正在断卦…' : '让 Claude 断卦'}
        </Button>
        {status === 'running' && (
          <Button variant="outline" onClick={() => abortRef.current?.abort()}>
            停止
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-broken">调用失败：{error}</p>}

      {thinking && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="self-start text-xs text-accent hover:underline"
          >
            {showThinking ? '收起推理过程' : '查看推理过程'}
          </button>
          {showThinking && (
            <pre className="whitespace-pre-wrap rounded-md bg-surface p-3 text-xs text-text-muted">
              {thinking}
            </pre>
          )}
        </div>
      )}

      {text && <div className="text-sm whitespace-pre-wrap">{text}</div>}
    </div>
  )
}
