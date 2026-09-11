import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { isConfigured } from '@/engine/aiProvider'
import { streamReading, type ChatMessage } from '@/engine/llm'
import { useSettingsStore } from '@/store/settingsStore'

type Status = 'idle' | 'running' | 'done' | 'failed'

/** 一问一答；question 为 null 表示开头那次整卦解读。 */
interface Exchange {
  question: string | null
  thinking: string
  answer: string
}

const starterQuestions = [
  '这一卦对我问的事，到底是吉是凶？用大白话说。',
  '用神是哪一爻？它现在是旺还是衰，为什么？',
  '如果应验，大概在什么时候？',
  '卦里有哪些对我不利的地方，需要注意什么？',
]

export function AIReadingPanel({ prompt }: { prompt: string }) {
  const ai = useSettingsStore((state) => state.ai)
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [openThinking, setOpenThinking] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const ready = isConfigured(ai)
  const running = status === 'running'
  const started = exchanges.length > 0

  /** 把已完成的问答还原成对话历史，首轮的 user 消息是整份卦盘证据。 */
  const historyFrom = (list: Exchange[]): ChatMessage[] =>
    list.flatMap((exchange) => [
      { role: 'user' as const, content: exchange.question ?? prompt },
      { role: 'assistant' as const, content: exchange.answer },
    ])

  const send = async (nextQuestion: string | null) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const previous = nextQuestion === null ? [] : exchanges
    const messages: ChatMessage[] = [
      ...historyFrom(previous),
      { role: 'user', content: nextQuestion ?? prompt },
    ]
    const pending: Exchange = { question: nextQuestion, thinking: '', answer: '' }
    const index = previous.length

    setExchanges([...previous, pending])
    setError('')
    setStatus('running')

    const update = (patch: (exchange: Exchange) => Exchange) =>
      setExchanges((list) => list.map((item, i) => (i === index ? patch(item) : item)))

    try {
      await streamReading(
        { config: ai, messages, signal: controller.signal },
        {
          onThinking: (delta) =>
            update((item) => ({ ...item, thinking: item.thinking + delta })),
          onText: (delta) => update((item) => ({ ...item, answer: item.answer + delta })),
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

  const ask = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || running) return
    setQuestion('')
    void send(trimmed)
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => void send(null)} disabled={!ready || running}>
          {running && !started ? '正在断卦…' : started ? '重新断卦' : 'AI 断卦'}
        </Button>
        {running && (
          <Button variant="outline" onClick={() => abortRef.current?.abort()}>
            停止
          </Button>
        )}
        <span className="text-xs text-text-muted">
          {ready ? ai.model : '还没配置接口，去「设置」填地址和密钥'}
        </span>
      </div>

      {error && <p className="text-sm text-broken">调用失败：{error}</p>}

      {exchanges.map((exchange, index) => (
        <div key={index} className="flex flex-col gap-1.5">
          {exchange.question && (
            <p className="self-end rounded-md bg-accent/10 px-3 py-1.5 text-sm text-accent">
              {exchange.question}
            </p>
          )}
          {exchange.thinking && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setOpenThinking(openThinking === index ? null : index)}
                className="self-start text-xs text-accent hover:underline"
              >
                {openThinking === index ? '收起推理过程' : '查看推理过程'}
              </button>
              {openThinking === index && (
                <pre className="whitespace-pre-wrap rounded-md bg-surface p-3 text-xs text-text-muted">
                  {exchange.thinking}
                </pre>
              )}
            </div>
          )}
          {exchange.answer && <div className="text-sm whitespace-pre-wrap">{exchange.answer}</div>}
          {running && index === exchanges.length - 1 && !exchange.answer && (
            <p className="text-sm text-text-muted">正在思考…</p>
          )}
        </div>
      ))}

      {started && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-sm text-text-muted">看不懂卦盘？接着问</span>
          <div className="flex flex-wrap gap-1.5">
            {starterQuestions.map((text) => (
              <button
                key={text}
                onClick={() => ask(text)}
                disabled={running}
                className="rounded-full border border-border px-2 py-0.5 text-xs hover:bg-surface disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ask(question)
              }}
              placeholder="就这一卦继续问，例如：世爻空亡是什么意思？"
              className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1 text-sm outline-none"
            />
            <Button onClick={() => ask(question)} disabled={running || !question.trim()}>
              发送
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
