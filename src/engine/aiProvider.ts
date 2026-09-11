/** 两种接口形状：OpenAI 兼容（绝大多数第三方/本地服务）与 Anthropic 原生。 */
export type ProviderKind = 'openai' | 'anthropic'

export interface ProviderPreset {
  id: string
  label: string
  kind: ProviderKind
  baseUrl: string
  /** 申请密钥的地址，方便用户去拿 key。 */
  keyUrl?: string
  note?: string
}

export const providerPresets: ProviderPreset[] = [
  {
    id: 'openrouter',
    label: 'OpenRouter',
    kind: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyUrl: 'https://openrouter.ai/keys',
    note: '聚合多家，带 :free 后缀的模型免费，返回价格可自动识别',
  },
  {
    id: 'groq',
    label: 'Groq',
    kind: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyUrl: 'https://console.groq.com/keys',
    note: '有免费额度，速度快',
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    kind: 'openai',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyUrl: 'https://aistudio.google.com/apikey',
    note: '有免费额度',
  },
  {
    id: 'siliconflow',
    label: '硅基流动 SiliconFlow',
    kind: 'openai',
    baseUrl: 'https://api.siliconflow.cn/v1',
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
    note: '有免费模型',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    kind: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'ollama',
    label: '本机 Ollama',
    kind: 'openai',
    baseUrl: 'http://localhost:11434/v1',
    note: '本地跑，免费；手机上用需填电脑的局域网地址',
  },
  {
    id: 'anthropic',
    label: 'Anthropic（Claude）',
    kind: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    note: '无免费额度，按量计费',
  },
  { id: 'custom', label: '自定义', kind: 'openai', baseUrl: '' },
]

export interface AiConfig {
  presetId: string
  kind: ProviderKind
  baseUrl: string
  apiKey: string
  model: string
}

export const emptyAiConfig: AiConfig = {
  presetId: 'openrouter',
  kind: 'openai',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: '',
  model: '',
}

/** 去掉结尾斜杠，避免拼出 //models。 */
export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '')
}

export function isConfigured(config: AiConfig): boolean {
  return Boolean(normalizeBaseUrl(config.baseUrl) && config.apiKey && config.model)
}
