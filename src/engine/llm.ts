/** 只列支持 adaptive thinking 的模型，省得为 budget_tokens 分支。 */
export const models = [
  { id: 'claude-opus-5', label: 'Claude Opus 5' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
] as const

export type ModelId = (typeof models)[number]['id']

const systemPrompt = [
  '你是六爻断卦助手，依《增删卜易》《卜筮正宗》一路的京房六爻法断卦。',
  '排盘事实（纳甲、六亲、世应、旺衰、旬空、月破日破、伏神、动变）由排盘引擎算出，是既定输入：一律照用，不得重算、改写或另立。',
  '你的工作是在这些事实之上推理：判用神旺衰生克，权衡命中条文之间的矛盾并说明取舍，再落到结论与应期。',
  '每条结论后标明依据：「依据 [条文编号]」「参照 [书例#编号]」或「推断」。证据不足就直说不足，不要为了完整而编。',
].join('\n')

export interface ReadingHandlers {
  onThinking: (delta: string) => void
  onText: (delta: string) => void
}

/**
 * 调用 Claude 断卦，流式返回。
 * 浏览器直连需要 dangerouslyAllowBrowser：密钥只存在用户自己浏览器里，
 * 也意味着这份密钥对本机上的脚本可见，只适合自用。
 */
export async function streamReading(
  options: {
    apiKey: string
    model: ModelId
    prompt: string
    signal?: AbortSignal
  },
  handlers: ReadingHandlers,
): Promise<void> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: options.apiKey, dangerouslyAllowBrowser: true })

  const stream = client.messages.stream(
    {
      model: options.model,
      max_tokens: 32000,
      thinking: { type: 'adaptive', display: 'summarized' },
      system: systemPrompt,
      messages: [{ role: 'user', content: options.prompt }],
    },
    { signal: options.signal },
  )

  for await (const event of stream) {
    if (event.type !== 'content_block_delta') continue
    if (event.delta.type === 'thinking_delta') handlers.onThinking(event.delta.thinking)
    if (event.delta.type === 'text_delta') handlers.onText(event.delta.text)
  }

  await stream.finalMessage()
}
