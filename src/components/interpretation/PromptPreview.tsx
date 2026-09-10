import { useState } from 'react'
import { useChart } from '@/hooks/useChart'
import { buildChartPrompt } from '@/engine/promptBuilder'
import { Button } from '@/components/ui/button'

export function PromptPreview() {
  const { chart } = useChart()
  const [copied, setCopied] = useState(false)

  if (!chart) {
    return <p className="text-sm text-text-muted">还没有卦盘，先去「起卦」生成一个。</p>
  }

  const prompt = buildChartPrompt(chart)

  return (
    <div className="flex flex-col gap-3">
      <pre className="whitespace-pre-wrap rounded-md border border-border bg-surface p-3 text-sm">
        {prompt}
      </pre>
      <Button
        className="self-start"
        onClick={async () => {
          await navigator.clipboard.writeText(prompt)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? '已复制' : '复制提示词'}
      </Button>
    </div>
  )
}
