import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { isConfigured } from '@/engine/aiProvider'
import { streamReading } from '@/engine/llm'
import { useSettingsStore } from '@/store/settingsStore'

type Status = 'idle' | 'running' | 'done' | 'failed'

export function AIReadingPanel({ prompt }: { prompt: string }) {
  const ai = useSettingsStore((state) => state.ai)
  const [thinking, setThinking] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [showThinking, setShowThinking] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const ready = isConfigured(ai)

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
        { config: ai, prompt, signal: controller.signal },
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
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => void run()} disabled={!ready || status === 'running'}>
          {status === 'running' ? '正在断卦…' : 'AI 断卦'}
        </Button>
        {status === 'running' && (
          <Button variant="outline" onClick={() => abortRef.current?.abort()}>
            停止
          </Button>
        )}
        <span className="text-xs text-text-muted">
          {ready ? ai.model : '还没配置接口，去「设置」填地址和密钥'}
        </span>
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
